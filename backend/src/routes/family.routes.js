const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const supabase = require("../services/supabase.service");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/api-error");

const router = express.Router();

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const { data: userInfo, error } = await supabase.from("user_information").select("father_name, father_occupation, mother_name, mother_occupation, family_type, siblings_count, family_values").eq("user_id", req.auth.userId).single();
    
    const family = userInfo ? {
       father_name: userInfo.father_name,
       father_occupation: userInfo.father_occupation,
       mother_name: userInfo.mother_name,
       mother_occupation: userInfo.mother_occupation,
       family_type: userInfo.family_type,
       siblings_count: userInfo.siblings_count,
       family_values: userInfo.family_values
    } : null;

    return sendSuccess(res, { family });
  } catch(err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to get family details"));
  }
});

router.put("/me", authMiddleware, async (req, res, next) => {
  try {
    const validColumns = [
       "father_name", "father_occupation", "mother_name", "mother_occupation",
       "family_type", "siblings_count", "family_values"
    ];
    const sanitizedBody = {};
    for (const key of validColumns) {
       if (req.body[key] !== undefined) {
         sanitizedBody[key] = req.body[key];
       }
    }
    
    // Check if exists
    const { data: existing } = await supabase.from("user_information").select("user_id").eq("user_id", req.auth.userId).single();

    let result;
    if (existing) {
      result = await supabase.from("user_information").update(sanitizedBody).eq("user_id", req.auth.userId).select().single();
    } else {
      result = await supabase.from("user_information").insert({ ...sanitizedBody, user_id: req.auth.userId }).select().single();
    }

    if (result.error) {
       console.error("Family Update DB Error:", result.error);
       return next(new ApiError(500, "SERVER_ERROR", "Failed to update family details"));
    }

    // Recalculate completeness
    const { data: updatedProfile } = await supabase.from("user_information").select("*").eq("user_id", req.auth.userId).single();
    if (updatedProfile) {
       const { calculateProfileCompletion } = require("../utils/completeness");
       const pct = calculateProfileCompletion(updatedProfile);
       await supabase.from("user_information").update({ profile_complete_pct: pct }).eq("user_id", req.auth.userId);
    }
    
    return sendSuccess(res, { family: result.data });
  } catch(err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to save family details"));
  }
});

module.exports = router;
