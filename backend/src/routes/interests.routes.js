const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const supabase = require("../services/supabase.service");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/api-error");

const router = express.Router();

/**
 * FIXED INTEREST SYSTEM
 * Follows the strict Supabase pattern and response flow requested.
 */

// 1. Create/Update Interest (Shortlist or Like)
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { to_profile_id, type } = req.body; 
    const fromProfileId = req.auth.profileId;

    if (!fromProfileId) throw new ApiError(401, "UNAUTHORIZED", "Your profile was not found.");
    if (!to_profile_id) throw new ApiError(400, "BAD_REQUEST", "Target profile ID is missing.");

    // RESOLVE target internal profile ID
    const { data: targetProf, error: resolveErr } = await supabase
      .from("user_information")
      .select("id")
      .or(`id.eq.${to_profile_id},user_id.eq.${to_profile_id}`)
      .maybeSingle();

    if (resolveErr) throw new ApiError(500, resolveErr.message);
    const targetId = targetProf?.id || to_profile_id;

    let result;
    if (type === 'shortlist') {
      const { data, error } = await supabase
        .from("interests")
        .upsert({ from_profile: fromProfileId, to_profile: targetId })
        .select()
        .maybeSingle();
      
      if (error) {
        console.error("[SHORTLIST_ERROR]", error);
        throw new ApiError(500, error.message);
      }
      result = data;
    } else {
      // type === 'like' (Connection Request)
      // Check if already exists to avoid RLS/Constraint issues with upsert if any
      const { data: existing } = await supabase
        .from("connectRequests")
        .select("id")
        .eq("from_profile", fromProfileId)
        .eq("to_profile", targetId)
        .maybeSingle();

      let op;
      if (existing) {
        op = await supabase
          .from("connectRequests")
          .update({ status: 'pending', updated_at: new Date().toISOString() })
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        op = await supabase
          .from("connectRequests")
          .insert({ 
            from_profile: fromProfileId, 
            to_profile: targetId, 
            status: 'pending' 
          })
          .select()
          .single();
      }
      
      if (op.error) {
        console.error("[CONNECT_REQUEST_ERROR]", op.error);
        // If it still fails with RLS, we throw a better error
        throw new ApiError(500, op.error.message || op.error.code);
      }
      result = op.data;

      // Notification logic (Wrapped in try/catch instead of .catch)
      try {
        const { data: s } = await supabase.from("user_information").select("full_name").eq("id", fromProfileId).maybeSingle();
        await supabase.from("notifications").insert({
          profile_id: targetId,
          type: "new_interest",
          title: "New Heartbeat! 💕",
          body: `${s?.full_name || 'Someone'} sent you a connection request.`,
          ref_id: fromProfileId
        }).select(); 
      } catch (e) {
        console.error("Silent Log: Notification failed", e.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Interest sent successfully",
      data: result
    });
  } catch (err) {
    console.error("[BACKEND_FIX_ERR]", err);
    return next(err instanceof ApiError ? err : new ApiError(500, err.message));
  }
});

// 2. Get Outgoing
router.get("/outgoing", authMiddleware, async (req, res, next) => {
  try {
    const myProfileId = req.auth.profileId;
    if (!myProfileId) return sendSuccess(res, { interests: [] });

    const [sh, reqs] = await Promise.all([
      supabase.from("interests").select("*, to_profile:user_information!interests_to_profile_fkey(*)").eq("from_profile", myProfileId),
      supabase.from("connectRequests").select("*, to_profile:user_information!connectRequests_to_profile_fkey(*)").eq("from_profile", myProfileId)
    ]);

    if (sh.error) throw new ApiError(500, sh.error.message);
    if (reqs.error) throw new ApiError(500, reqs.error.message);

    const merged = [
      ...(sh.data || []).map(i => ({ ...i, type: 'shortlist' })),
      ...(reqs.data || []).map(r => ({ ...r, type: r.status === 'pending' ? 'like' : r.status }))
    ];

    return res.status(200).json({
      success: true,
      message: "Outgoing interests fetched",
      data: { interests: merged }
    });
  } catch (err) {
    return next(err);
  }
});

// 3. Get Incoming
router.get("/incoming", authMiddleware, async (req, res, next) => {
  try {
    const myProfileId = req.auth.profileId;
    const { data, error } = await supabase
      .from("connectRequests")
      .select("*, from_profile:user_information!connectRequests_from_profile_fkey(*)")
      .eq("to_profile", myProfileId)
      .eq("status", "pending");

    if (error) throw new ApiError(500, error.message);

    return res.status(200).json({
      success: true,
      message: "Incoming requests fetched",
      data: { interests: (data || []).map(i => ({ ...i, type: 'like' })) }
    });
  } catch (err) {
    return next(err);
  }
});

// 4. Update Status (Accept/Decline)
router.patch("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { action } = req.body;
    const myProfileId = req.auth.profileId;

    const { data: request, error: fErr } = await supabase.from("connectRequests").select("*").eq("id", req.params.id).single();
    if (fErr || !request) throw new ApiError(404, "Request not found");

    if (action === 'accepted') {
      const { data: b, error: bErr } = await supabase
        .from("bonds")
        .upsert({ profile_a: request.from_profile, profile_b: request.to_profile, status: 'active' })
        .select()
        .single();
      
      if (bErr) throw new ApiError(500, bErr.message);

      const { data: u, error: uErr } = await supabase
        .from("connectRequests")
        .update({ status: 'accepted', bond_id: b.id })
        .eq("id", request.id)
        .select()
        .single();

      if (uErr) throw new ApiError(500, uErr.message);

      return res.status(200).json({
        success: true,
        message: "Request accepted successfully",
        data: { ...u, type: 'accepted' }
      });
    } else {
      const { data: u, error: uErr } = await supabase.from("connectRequests").update({ status: 'declined' }).eq("id", request.id).select().single();
      if (uErr) throw new ApiError(500, uErr.message);
      return res.status(200).json({
        success: true,
        message: "Request declined",
        data: { ...u, type: 'declined' }
      });
    }
  } catch (err) {
    return next(err);
  }
});

// 5. Delete Interest
router.delete("/profile/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id: targetId } = req.params;
    const myId = req.auth.profileId;

    const { error: e1 } = await supabase.from("interests").delete().eq("from_profile", myId).eq("to_profile", targetId);
    const { error: e2 } = await supabase.from("connectRequests").delete().eq("from_profile", myId).eq("to_profile", targetId).eq("status", "pending");

    if (e1) throw new ApiError(500, e1.message);
    // e2 is optional as it might not be a request

    return res.status(200).json({
      success: true,
      message: "Interest removed successfully"
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/bonds", authMiddleware, async (req, res, next) => {
  try {
    const myProfileId = req.auth.profileId;
    if (!myProfileId) throw new ApiError(401, "Profile not found");

    // Fetch accepted requests where user is either sender or receiver
    const [sent, received] = await Promise.all([
      supabase
        .from("connectRequests")
        .select("*, to_profile:user_information!connectRequests_to_profile_fkey(*)")
        .eq("from_profile", myProfileId)
        .eq("status", "accepted"),
      supabase
        .from("connectRequests")
        .select("*, from_profile:user_information!connectRequests_from_profile_fkey(*)")
        .eq("to_profile", myProfileId)
        .eq("status", "accepted")
    ]);

    if (sent.error) throw new ApiError(500, sent.error.message);
    if (received.error) throw new ApiError(500, received.error.message);

    const merged = [
      ...(sent.data || []).map(r => ({ 
        id: r.bond_id || r.id, // Fallback to request ID if bond_id isn't linked yet
        otherProfile: r.to_profile,
        status: 'active',
        created_at: r.created_at
      })),
      ...(received.data || []).map(r => ({ 
        id: r.bond_id || r.id, 
        otherProfile: r.from_profile,
        status: 'active',
        created_at: r.created_at
      }))
    ];

    return res.status(200).json({
      success: true,
      message: "Bonds fetched from accepted requests",
      data: { bonds: merged }
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
