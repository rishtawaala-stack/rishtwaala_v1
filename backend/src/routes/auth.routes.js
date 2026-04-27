const express = require("express");
const supabase = require("../services/supabase.service");
const authMiddleware = require("../middleware/auth.middleware");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/api-error");

const router = express.Router();

// Register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, phone, password, dob, gender } = req.body;

    if (!email || !password || !name) {
      return next(new ApiError(400, "VALIDATION_ERROR", "Name, email, and password are required."));
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phone, gender, dob }
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      return next(new ApiError(400, "AUTH_ERROR", authError.message));
    }

    const userId = authData.user.id;

    // Create user record
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      phone: phone || "",
      email: email,
      phone_verified: false,
      email_verified: true
    });

    if (userError) {
      console.error("User insert error:", userError);
    }

    // Calculate age from DOB
    let age = null;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    }

    // Create profile in unified table with 30% completion
    const { error: profileError } = await supabase.from("user_information").insert({
      user_id: userId,
      full_name: name,
      dob: dob || "2000-01-01",
      age: age,
      gender: (gender || "male").toLowerCase(),
      religion: "Not specified",
      caste: "Not specified",
      mother_tongue: "Not specified",
      marital_status: "never_married",
      current_city: "Not specified",
      current_state: "Not specified",
      current_country: "India",
      education_level: "Not specified",
      annual_income_range: "Not specified",
      profile_complete_pct: 30,
      profile_photo_url: null
    });

    if (profileError) {
      console.error("Profile insert error:", profileError);
    }

    // Generate a session token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email
    });

    // For dev mode, use access token from sign in
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });

    const token = signInData?.session?.access_token || userId;

    return sendSuccess(res, {
      token,
      user: {
        id: userId,
        name,
        email,
        phone,
        gender,
        dob,
        profile_complete_pct: 30
      }
    }, {}, 201);
  } catch (err) {
    console.error("Register error:", err);
    return next(new ApiError(500, "SERVER_ERROR", "Registration failed: " + err.message));
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "VALIDATION_ERROR", "Email and password are required."));
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return next(new ApiError(401, "AUTH_ERROR", "Invalid email or password."));
    }

    const userId = data.user.id;
    const token = data.session.access_token;

    // Fetch user's profile from unified table
    const { data: userInfo } = await supabase
      .from("user_information")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Fetch user record
    const { data: userRecord } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return sendSuccess(res, {
      token,
      user: {
        id: userId,
        name: userInfo?.full_name || data.user?.user_metadata?.name || userRecord?.name || "User",
        full_name: userInfo?.full_name || data.user?.user_metadata?.name || userRecord?.name || "User",
        email: data.user.email,
        phone: userRecord?.phone || data.user.user_metadata?.phone || "",
        gender: userInfo?.gender || "",
        dob: userInfo?.dob || "",
        profile_complete_pct: userInfo?.profile_complete_pct || 30,
        profile_photo_url: userInfo?.profile_photo_url || null,
        profileId: userInfo?.id || null
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return next(new ApiError(500, "SERVER_ERROR", "Login failed: " + err.message));
  }
});

// Send OTP (dev mode - shows in alert)
router.post("/send-otp", async (req, res, next) => {
  try {
    const { phone } = req.body;
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In development mode, just return the OTP in the response
    return sendSuccess(res, {
      message: "OTP sent successfully (DEV MODE)",
      otp: otp, // In prod, this would be sent via SMS only
      phone
    });
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to send OTP"));
  }
});

// Verify OTP (dev mode)
router.post("/verify-otp", async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    // In dev mode, always accept
    return sendSuccess(res, { verified: true, phone });
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "OTP verification failed"));
  }
});

// Get current user
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    let authName = null;
    const tokenStr = req.headers.authorization?.split(" ")?.[1];
    if (tokenStr) {
       const { data: authRes } = await supabase.auth.getUser(tokenStr);
       authName = authRes?.user?.user_metadata?.name;
    }

    const { data: userRecord } = await supabase.from("users").select("*").eq("id", userId).single();
    
    // FETCH UNIFIED SINGLE FLAT TABLE
    let { data: userInfo } = await supabase.from("user_information").select("*").eq("user_id", userId).single();
    
    if (!userInfo) {
       // Gracefully create if they signed up using ancient flows!
       const initName = authName || userRecord?.name || "User";
       const { data: newInfo } = await supabase.from("user_information").insert({ user_id: userId, full_name: initName, profile_complete_pct: 30 }).select().single();
       userInfo = newInfo || { user_id: userId, full_name: initName, profile_complete_pct: 30 };
    }

    const resolvedName = userInfo.full_name || authName || userRecord?.name || "User";
    const currentDbPct = userInfo.profile_complete_pct || 0;

    const { calculateProfileCompletion } = require("../utils/completeness");
    userInfo.profile_complete_pct = calculateProfileCompletion(userInfo);

    // Persist this calculation back to the database if it's different
    if (userInfo.profile_complete_pct !== currentDbPct) {
       await supabase.from("user_information").update({ profile_complete_pct: userInfo.profile_complete_pct }).eq("user_id", userId);
    }

    return sendSuccess(res, {
      user: {
        id: userId,
        name: resolvedName,
        full_name: resolvedName,
        email: userRecord?.email || "",
        phone: userRecord?.phone || "",
        gender: userInfo.gender || "",
        dob: userInfo.dob || "",
        age: userInfo.age || null,
        height_cm: userInfo.height_cm || null,
        weight_kg: userInfo.weight_kg || null,
        complexion: userInfo.complexion || null,
        religion: userInfo.religion || "",
        caste: userInfo.caste || "",
        mother_tongue: userInfo.mother_tongue || "",
        marital_status: userInfo.marital_status || "",
        current_city: userInfo.current_city || "",
        current_state: userInfo.current_state || "",
        current_country: userInfo.current_country || "",
        education_level: userInfo.education_level || "",
        education_field: userInfo.education_field || "",
        institution: userInfo.institution || "",
        occupation_type: userInfo.occupation_type || "",
        occupation_detail: userInfo.occupation_detail || "",
        employer: userInfo.employer || "",
        annual_income_range: userInfo.annual_income_range || "",
        diet: userInfo.diet || "",
        smoking: userInfo.smoking || "",
        drinking: userInfo.drinking || "",
        hobbies: [],
        interests: [],
        bio: userInfo.bio || "",
        profile_photo_url: userInfo.profile_photo_url || null,
        profile_complete_pct: userInfo.profile_complete_pct || 0,
        is_premium: false,
        profileId: userInfo.id,
        created_at: userInfo.created_at || null,
        family: {
          father_name: userInfo.father_name || "",
          father_occupation: userInfo.father_occupation || "",
          mother_name: userInfo.mother_name || "",
          mother_occupation: userInfo.mother_occupation || "",
          family_type: userInfo.family_type || "",
          siblings_count: userInfo.siblings_count || 0,
          family_values: userInfo.family_values || ""
        },
        preferences: {
          age_min: userInfo.pref_age_min || null,
          age_max: userInfo.pref_age_max || null,
          height_min_cm: userInfo.pref_height_min_cm || null,
          height_max_cm: userInfo.pref_height_max_cm || null,
          religion: userInfo.pref_religion || [],
          education_level: userInfo.pref_education_level || [],
          diet: userInfo.pref_diet || []
        },
        media: []
      }
    });
  } catch (err) {
    console.error("Fetch user error:", err);
    return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch user data"));
  }
});

module.exports = router;
