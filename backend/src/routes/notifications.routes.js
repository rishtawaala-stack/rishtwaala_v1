const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const supabase = require("../services/supabase.service");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/api-error");

const router = express.Router();

// Get all notifications
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    if (!req.auth.profileId) {
      return sendSuccess(res, { notifications: [], unread_count: 0 });
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("profile_id", req.auth.profileId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Notifications fetch error:", error);
      return sendSuccess(res, { notifications: [], unread_count: 0 });
    }

    const unread = (data || []).filter(n => !n.is_read).length;

    // For match notifications, fetch the ref profile details
    const enriched = [];
    for (const n of (data || [])) {
      let refProfile = null;
      if (n.ref_id && ["match", "new_interest", "profile_view"].includes(n.type)) {
        const { data: profile } = await supabase
          .from("user_information")
          .select("id, full_name, age, gender, current_city, profile_photo_url, occupation_detail, education_level, annual_income_range, religion, bio, height_cm, complexion, marital_status, mother_tongue")
          .eq("id", n.ref_id)
          .single();
        refProfile = profile;
      }
      enriched.push({ ...n, refProfile });
    }

    return sendSuccess(res, { notifications: enriched, unread_count: unread });
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch notifications"));
  }
});

// Mark notification as read
router.post("/:id/read", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("profile_id", req.auth.profileId);

    return sendSuccess(res, { read: true });
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to mark as read"));
  }
});

// Mark all as read
router.post("/read-all", authMiddleware, async (req, res, next) => {
  try {
    if (!req.auth.profileId) {
      return sendSuccess(res, { read: true });
    }
    
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("profile_id", req.auth.profileId)
      .eq("is_read", false);

    return sendSuccess(res, { read: true });
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to mark all as read"));
  }
});

module.exports = router;
