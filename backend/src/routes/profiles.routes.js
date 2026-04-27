const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const supabase = require("../services/supabase.service");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/api-error");

const router = express.Router();

// Get my profile
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from("user_information")
      .select("*")
      .eq("user_id", req.auth.userId)
      .maybeSingle();

    if (error || !profile) {
      return sendSuccess(res, { profile: null, message: "Profile not found. Complete your registration." });
    }

    return sendSuccess(res, { profile });
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch profile"));
  }
});

// Get profile completeness  
router.get("/me/completeness", authMiddleware, async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from("user_information")
      .select("profile_complete_pct, full_name, profile_photo_url, education_level, occupation_detail, annual_income_range, current_city, bio, height_cm, religion, caste")
      .eq("user_id", req.auth.userId)
      .maybeSingle();

    if (!profile) {
      return sendSuccess(res, { completeness: 0, missing: ["Everything"] });
    }

    // Calculate what's missing
    const missing = [];
    if (!profile.profile_photo_url) missing.push("Profile Photo");
    if (!profile.education_level || profile.education_level === "Not specified") missing.push("Education");
    if (!profile.occupation_detail) missing.push("Profession");
    if (!profile.annual_income_range || profile.annual_income_range === "Not specified") missing.push("Income");
    if (!profile.current_city || profile.current_city === "Not specified") missing.push("Location");
    if (!profile.bio) missing.push("Bio");
    if (!profile.height_cm) missing.push("Height");
    if (!profile.religion || profile.religion === "Not specified") missing.push("Religion");

    return sendSuccess(res, {
      completeness: profile.profile_complete_pct,
      missing
    });
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to compute completeness"));
  }
});

// Update my profile
router.patch("/me", authMiddleware, async (req, res, next) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const logPath = path.join(__dirname, "../../logs.txt");
    fs.appendFileSync(logPath, `\n--- PATCH /me at ${new Date().toISOString()} ---\n`);
    fs.appendFileSync(logPath, `AUTH: ${JSON.stringify(req.auth)}\n`);
    fs.appendFileSync(logPath, `BODY: ${JSON.stringify(req.body)}\n`);

    const updates = req.body;

    const validColumns = [
      "full_name", "dob", "age", "gender", "religion", 
      "caste", "mother_tongue", "marital_status", "current_city", "current_state", 
      "current_country", "education_level", "education_field", "institution", 
      "occupation_type", "occupation_detail", "employer", "annual_income_range", 
      "diet", "smoking", "drinking", "bio", "height_cm", 
      "weight_kg", "complexion", "profile_photo_url", "profile_complete_pct"
    ];

    const sanitizedPayload = {};
    for (const key of validColumns) {
       if (updates[key] !== undefined) {
          // DATABASE FIX: Never send empty strings for DATE columns
          if (key === "dob" && updates[key] === "") {
             sanitizedPayload[key] = null;
          } 
          // NAME FIX: Never overwrite real names with "User"
          else if (key === "full_name" && updates[key] === "User") {
             continue; 
          }
          else {
             sanitizedPayload[key] = updates[key];
          }
       }
    }

    // AGE CALCULATION: If DOB is present but age is missing, calculate it
    if (sanitizedPayload.dob && !sanitizedPayload.age) {
       const birthDate = new Date(sanitizedPayload.dob);
       const today = new Date();
       let calculatedAge = today.getFullYear() - birthDate.getFullYear();
       const m = today.getMonth() - birthDate.getMonth();
       if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calculatedAge--;
       sanitizedPayload.age = calculatedAge;
    }

    // Fetch existing profile to calculate final completion based on ALL fields, not just updates
    const { data: currentProfile } = await supabase
      .from("user_information")
      .select("*")
      .eq("user_id", req.auth.userId)
      .single();

    const mergedProfile = { ...(currentProfile || {}), ...sanitizedPayload };

    const { calculateProfileCompletion } = require("../utils/completeness");
    sanitizedPayload.profile_complete_pct = calculateProfileCompletion(mergedProfile);

    let data, error;
    if (currentProfile) {
      const { data: updated, error: updateErr } = await supabase.from("user_information").update(sanitizedPayload).eq("user_id", req.auth.userId).select().single();
      data = updated;
      error = updateErr;
    } else {
      const res = await supabase.from("user_information").insert({ ...sanitizedPayload, user_id: req.auth.userId }).select().single();
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error("Profile update error:", error);
      return next(new ApiError(500, "SERVER_ERROR", error.message));
    }

    return sendSuccess(res, { profile: data });
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to update profile"));
  }
});

// View another user's profile
router.get("/:profileId", authMiddleware, async (req, res, next) => {
  try {
    const { profileId } = req.params;

    let { data: profile, error: profileErr } = await supabase
      .from("user_information")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();

    if (!profile) {
      // Fallback: try searching by user_id in case the frontend is passing auth user id
      const { data: profileByUserId, error: secondErr } = await supabase
        .from("user_information")
        .select("*")
        .eq("user_id", profileId)
        .maybeSingle();
      
      if (profileByUserId) {
        profile = profileByUserId;
        profileErr = null;
      }
    }

    if (profileErr || !profile) {
      console.error("Profile not found after fallback:", profileId, profileErr);
      return next(new ApiError(404, "NOT_FOUND", "Profile not found"));
    }

    // Fetch viewer details to show name in notification
    let viewerName = 'Someone';
    if (req.auth?.profileId) {
      try {
        const { data: viewer } = await supabase
          .from("user_information")
          .select("full_name")
          .eq("id", req.auth.profileId)
          .maybeSingle();
        if (viewer?.full_name) viewerName = viewer.full_name;

        // Create notification for the viewed user
        await supabase.from("notifications").insert({
          profile_id: profileId,
          type: "profile_view",
          title: "Profile Visited ✨",
          body: `${viewerName} just checked your profile.`,
          ref_id: req.auth.profileId
        }).catch(err => console.error("Notif Error:", err));
      } catch (e) {
        console.error("Viewer fetch/notif error:", e);
      }
    }

    // Fetch media
    const { data: media, error: mediaErr } = await supabase
      .from("media")
      .select("*")
      .eq("profile_id", profileId)
      .order("order", { ascending: true });

    if (mediaErr) console.error("Media Error:", mediaErr);

    return sendSuccess(res, {
      profile: { ...profile, media: media || [] }
    });
  } catch (err) {
    console.error("DEBUG: 500 at GET /profiles/:id", err);
    return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch profile: " + err.message));
  }
});

// Record profile view
router.post("/:profileId/view", authMiddleware, async (req, res, next) => {
  try {
    const { profileId } = req.params;
    if (req.auth.profileId) {
      await supabase.from("profile_views").insert({
        viewer_id: req.auth.profileId,
        viewed_id: profileId
      });
    }
    return sendSuccess(res, { recorded: true }, {}, 201);
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to record view"));
  }
});

module.exports = router;
