const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const supabase = require("../services/supabase.service");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/api-error");

const router = express.Router();

const { calculateMatchScore } = require("../utils/match-meter");
const { getAIMatchScore } = require("../services/ai.service");

// Get matches (profiles that could match with current user)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    // Get my profile details from unified table
    const { data: myProfile, error: myProfileErr } = await supabase
      .from("user_information")
      .select("*")
      .eq("user_id", req.auth.userId)
      .single();

    if (myProfileErr || !myProfile) {
      return next(new ApiError(404, "NOT_FOUND", "Your profile was not found."));
    }

    /* 
    if ((myProfile.profile_complete_pct || 0) < 100) {
      return sendSuccess(res, [], { message: "Complete your profile to 100% to view matches" });
    }
    */

    const oppositeGender = myProfile.gender === "male" ? "female" : "male";

    const { data: profiles, error } = await supabase
      .from("user_information")
      .select("*")
      .eq("gender", oppositeGender)
      // .eq("profile_complete_pct", 100)
      .neq("user_id", req.auth.userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return sendSuccess(res, []);

    // Calculate scores
    const matchesWithScore = await Promise.all((profiles || []).map(async (p) => {
      let score = calculateMatchScore(myProfile, p);
      
      return {
        id: p.id,
        name: p.full_name,
        age: p.age,
        location: p.current_city,
        state: p.current_state,
        image: p.profile_photo_url,
        profession: p.occupation_detail || p.education_level || "Professional",
        religion: p.religion,
        caste: p.caste,
        income: p.annual_income_range,
        height_cm: p.height_cm,
        education_level: p.education_level || p.education_field,
        family_type: p.family_type,
        interests: p.interests || [],
        hobbies: p.hobbies || [],
        compatibility: score,
        profile_complete_pct: p.profile_complete_pct
      };
    }));

    return sendSuccess(res, matchesWithScore.sort((a, b) => b.compatibility - a.compatibility));
  } catch (err) {
    console.error("Match error:", err);
    return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch matches"));
  }
});

// Get AI matching for a specific profile (detailed view)
router.post("/calculate-ai/:targetId", authMiddleware, async (req, res, next) => {
    try {
        const { targetId } = req.params;
        
        const { data: myProfile } = await supabase
            .from("user_information")
            .select("*")
            .eq("user_id", req.auth.userId)
            .single();
            
        const { data: targetProfile } = await supabase
            .from("user_information")
            .select("*")
            .eq("id", targetId)
            .single();
            
        if (!myProfile || !targetProfile) {
            return next(new ApiError(404, "NOT_FOUND", "Profile not found"));
        }
        
        const aiScore = await getAIMatchScore(myProfile, targetProfile);
        
        return sendSuccess(res, { 
            score: aiScore || calculateMatchScore(myProfile, targetProfile),
            is_ai: !!aiScore 
        });
    } catch (err) {
        return next(new ApiError(500, "SERVER_ERROR", "AI calculation failed"));
    }
});

// Get connected matches only (for chat)
router.get("/connected", authMiddleware, async (req, res, next) => {
  try {
    const myProfileId = req.auth.profileId;
    if (!myProfileId) return sendSuccess(res, []);

    // Get active bonds
    const { data: bBonds } = await supabase
      .from("bonds")
      .select("*")
      .eq("status", "active")
      .or(`profile_a.eq.${myProfileId},profile_b.eq.${myProfileId}`)
      .order("updated_at", { ascending: false });

    if (!bBonds) return sendSuccess(res, []);

    const connections = [];
    for (const bond of bBonds) {
      const otherProfileId = bond.profile_a === myProfileId ? bond.profile_b : bond.profile_a;
      
      const { data: otherProfile } = await supabase
        .from("user_information")
        .select("id, full_name, profile_photo_url, user_id")
        .eq("id", otherProfileId)
        .single();
        
      if (otherProfile) {
        connections.push({
          ...otherProfile,
          conversationId: bond.id,
          lastMessageAt: bond.updated_at
        });
      }
    }

    return sendSuccess(res, connections);
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch connections"));
  }
});

module.exports = router;
