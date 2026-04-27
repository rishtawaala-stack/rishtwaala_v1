const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const supabase = require("../services/supabase.service");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/api-error");

const router = express.Router();

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const { data: userInfo, error } = await supabase.from("user_information").select("pref_age_min, pref_age_max, pref_height_min_cm, pref_height_max_cm, pref_religion, pref_education_level, pref_diet").eq("user_id", req.auth.userId).single();
    
    const preferences = userInfo ? {
       age_min: userInfo.pref_age_min,
       age_max: userInfo.pref_age_max,
       height_min_cm: userInfo.pref_height_min_cm,
       height_max_cm: userInfo.pref_height_max_cm,
       religion: userInfo.pref_religion,
       education_level: userInfo.pref_education_level,
       diet: userInfo.pref_diet
    } : null;

    return sendSuccess(res, { preferences });
  } catch(err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to get partner preferences"));
  }
});

router.put("/me", authMiddleware, async (req, res, next) => {
  try {
    const validColumns = [
       "pref_age_min", "pref_age_max", "pref_height_min_cm", "pref_height_max_cm",
       "pref_religion", "pref_education_level", "pref_diet"
    ];
    const sanitizedBody = {};
    for (const key of validColumns) {
       // Check base property or pref_ prefixed property
       const baseKey = key.startsWith("pref_") ? key.substring(5) : key;
       if (req.body[baseKey] !== undefined) {
         sanitizedBody[key] = req.body[baseKey];
       } else if (req.body[key] !== undefined) {
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
       console.error("Preferences Update DB Error:", result.error);
       return next(new ApiError(500, "SERVER_ERROR", "Failed to update preferences"));
    }
    
    return sendSuccess(res, { preferences: result.data });
  } catch(err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to save preferences"));
  }
});

module.exports = router;
