const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const supabase = require("../services/supabase.service");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/api-error");
const { checkConversationDepth } = require("../utils/conversation");

const router = express.Router();

// Get all bonds (conversations)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const profileId = req.auth.profileId;
    if (!profileId) {
      return sendSuccess(res, []);
    }

    // 1. Fetch ALL Accepted Relationships from connectRequests
    // Joining with user_information via both potential profile foreign keys
    const [sent, received] = await Promise.all([
      supabase
        .from("connectRequests")
        .select("*, to_profile:user_information!connectRequests_to_profile_fkey(*), bond:bonds(*)")
        .eq("from_profile", profileId)
        .eq("status", "accepted"),
      supabase
        .from("connectRequests")
        .select("*, from_profile:user_information!connectRequests_from_profile_fkey(*), bond:bonds(*)")
        .eq("to_profile", profileId)
        .eq("status", "accepted")
    ]);

    if (sent.error) throw new ApiError(500, sent.error.message);
    if (received.error) throw new ApiError(500, received.error.message);

    const conversations = [
      ...(sent.data || []).map(r => ({
        id: r.bond_id || r.id,
        otherProfile: r.to_profile,
        lastMessage: r.bond?.last_message || "Start a conversation!",
        isEngagementUnlocked: (r.bond?.message_count >= 1) || false,
        isContactShared: r.bond?.is_contact_shared || false,
        createdAt: r.bond?.updated_at || r.updated_at || r.created_at
      })),
      ...(received.data || []).map(r => ({
        id: r.bond_id || r.id,
        otherProfile: r.from_profile,
        lastMessage: r.bond?.last_message || "Start a conversation!",
        isEngagementUnlocked: (r.bond?.message_count >= 1) || false,
        isContactShared: r.bond?.is_contact_shared || false,
        createdAt: r.bond?.updated_at || r.updated_at || r.created_at
      }))
    ];

    // 2. Sort by most recent
    conversations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return sendSuccess(res, conversations);
  } catch (err) {
    console.error("[BONDS_FETCH_ERROR]", err);
    return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch bonds"));
  }
});

// Get messages for a bond
router.get("/:conversationId/messages", authMiddleware, async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const { data: messages, error } = await supabase
      .from("bond_messages")
      .select("*")
      .eq("bond_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("[MESSAGES_ERROR]", error);
      return sendSuccess(res, []);
    }

    // Map for frontend compatibility
    const formatted = (messages || []).map(m => ({
      ...m,
      sender_id: m.sender_id,
      content: m.content,
      sent_at: m.created_at
    }));

    return sendSuccess(res, formatted);
  } catch (err) {
    return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch bond messages"));
  }
});

// 3. Send Message
router.post("/:conversationId/messages", authMiddleware, async (req, res, next) => {
  try {
    const { content } = req.body;
    const senderId = req.auth.profileId;
    let bondId = req.params.conversationId;

    if (!senderId) throw new ApiError(401, "Unauthorized");
    if (!content) throw new ApiError(400, "Content required");

    // 1. Ensure the Bond exists (Foreign Key requirement)
    let { data: bond, error: bondErr } = await supabase.from("bonds").select("id, profile_a, profile_b").eq("id", bondId).maybeSingle();

    if (!bond) {
      // It might be a connectRequest ID. Try to find the request and create the bond.
      const { data: request } = await supabase
        .from("connectRequests")
        .select("*")
        .eq("id", bondId)
        .maybeSingle();

      if (request && request.status === 'accepted') {
        // Auto-create bond to satisfy foreign key
        const { data: newBond, error: createErr } = await supabase
          .from("bonds")
          .upsert({ profile_a: request.from_profile, profile_b: request.to_profile, status: 'active' })
          .select()
          .single();

        if (!createErr && newBond) {
          bond = newBond;
          bondId = newBond.id;
          // Link the request to the new bond for future reliability
          await supabase.from("connectRequests").update({ bond_id: bondId }).eq("id", request.id);
        }
      }
    }

    if (!bond) {
      // If still no bond, we can't insert into bond_messages due to FK
      throw new ApiError(400, "Connection not fully established. Please refresh.");
    }

    // 2. Insert Message
    const { data: message, error: msgErr } = await supabase
      .from("bond_messages")
      .insert({
        bond_id: bondId,
        sender_id: senderId,
        content: content,
        is_read: false
      })
      .select()
      .single();

    if (msgErr) throw new ApiError(500, msgErr.message);

    // 3. Update Meta & Handle Unlock
    try {
      const ts = new Date().toISOString();
      const newCount = (bond.message_count || 0) + 1;

      await supabase.from("bonds").update({
        message_count: newCount,
        last_message: content,
        updated_at: ts
      }).eq("id", bondId);

      // Check for Engagement Unlock
      const depth = await checkConversationDepth(bondId, bond.profile_a, bond.profile_b);

      if (depth.eligible) {
        // Double check if already unlocked to avoid duplicate system messages
        const { data: existingUnlock } = await supabase
          .from("bond_messages")
          .select("id")
          .eq("bond_id", bondId)
          .maybeSingle();

        if (!existingUnlock) {
          // Inject System Message
          await supabase.from("bond_messages").insert({
            bond_id: bondId,
            sender_id: senderId, // Or a dedicated system ID if available
            content: "This conversation has reached a meaningful level. You can now match Kundali or share contact.",
            is_read: false
          });
        }
      }

    } catch (e) { console.error("Meta/Unlock Update Error:", e); }

    // 4. Send Notification (Silent)
    try {
      const recipientId = bond.profile_a === senderId ? bond.profile_b : bond.profile_a;
      const { data: s } = await supabase.from("user_information").select("full_name").eq("id", senderId).single();
      await supabase.from("notifications").insert({
        profile_id: recipientId,
        type: "new_message",
        title: "New Message! 💬",
        body: `${s?.full_name || 'Someone'} sent you a message: ${content.substring(0, 30)}...`,
        ref_id: bondId
      });
    } catch (e) { console.error("Notification Error:", e); }

    return res.status(200).json({
      success: true,
      message: "Message sent",
      data: message
    });

  } catch (err) {
    console.error("[MSG_SEND_ERR]", err);
    return next(err instanceof ApiError ? err : new ApiError(500, err.message));
  }
});

// --- Contact Sharing Routes ---

// 1. Request Contact Sharing
router.post("/:bondId/share-contact-request", authMiddleware, async (req, res, next) => {
  try {
    const { bondId } = req.params;
    const senderId = req.auth.profileId;

    const { data: bond, error } = await supabase
      .from("bonds")
      .select("*")
      .eq("id", bondId)
      .single();

    if (error || !bond) throw new ApiError(404, "Connection not found");
    if (bond.is_contact_shared) throw new ApiError(400, "Contact already shared");

    const recipientId = bond.profile_a === senderId ? bond.profile_b : bond.profile_a;
    const { data: senderInfo } = await supabase.from("user_information").select("full_name").eq("id", senderId).single();

    // Insert System Message with Action Buttons
    const { data: message, error: msgErr } = await supabase
      .from("bond_messages")
      .insert({
        bond_id: bondId,
        sender_id: senderId,
        content: `${senderInfo?.full_name || 'User'} wants to share contact details. Click Accept to exchange phone numbers.`,
        is_read: false
      })
      .select()
      .single();

    if (msgErr) throw new ApiError(500, msgErr.message);

    return sendSuccess(res, message, "Contact share request sent");
  } catch (err) {
    next(err);
  }
});

// 2. Respond to Contact Sharing (Accept/Decline)
router.post("/:bondId/respond-contact-share", authMiddleware, async (req, res, next) => {
  try {
    const { bondId } = req.params;
    const { accept, requestId } = req.body;
    const userId = req.auth.profileId;

    const { data: bond, error } = await supabase
      .from("bonds")
      .select("*")
      .eq("id", bondId)
      .single();

    if (error || !bond) throw new ApiError(404, "Connection not found");

    if (!accept) {
      await supabase.from("bond_messages").insert({
        bond_id: bondId,
        sender_id: userId,
        content: "Contact sharing request was declined.",
        is_read: false
      });
      return sendSuccess(res, null, "Request declined");
    }

    // ACCEPT Logic
    // 1. Fetch profile info and phone numbers separately to avoid complex join issues
    console.log(`[CONTACT_SHARE] Starting exchange for bond ${bondId}`);

    const [resInfoA, resInfoB] = await Promise.all([
      supabase.from("user_information").select("full_name, user_id").eq("id", bond.profile_a).single(),
      supabase.from("user_information").select("full_name, user_id").eq("id", bond.profile_b).single()
    ]);

    if (resInfoA.error) console.error("[CONTACT_SHARE] Error fetching profile A:", resInfoA.error);
    if (resInfoB.error) console.error("[CONTACT_SHARE] Error fetching profile B:", resInfoB.error);

    const [resUserA, resUserB] = await Promise.all([
      resInfoA.data?.user_id ? supabase.from("users").select("phone").eq("id", resInfoA.data.user_id).maybeSingle() : Promise.resolve({ data: null }),
      resInfoB.data?.user_id ? supabase.from("users").select("phone").eq("id", resInfoB.data.user_id).maybeSingle() : Promise.resolve({ data: null })
    ]);

    let phoneA = resUserA.data?.phone;
    let phoneB = resUserB.data?.phone;

    // Deep identification log
    console.log(`[CONTACT_SHARE] Profiles: A=${bond.profile_a}, B=${bond.profile_b}`);

    // Fallback Logic A
    if (!phoneA && resInfoA.data?.user_id) {
        const { data: wrapA } = await supabase.auth.admin.getUserById(resInfoA.data.user_id);
        const u = wrapA?.user;
        phoneA = u?.phone || u?.user_metadata?.phone || u?.user_metadata?.mobile || u?.user_metadata?.phone_number || u?.user_metadata?.phoneNumber;
    }
    
    // Fallback Logic B
    if (!phoneB && resInfoB.data?.user_id) {
        const { data: wrapB } = await supabase.auth.admin.getUserById(resInfoB.data.user_id);
        const u = wrapB?.user;
        phoneB = u?.phone || u?.user_metadata?.phone || u?.user_metadata?.mobile || u?.user_metadata?.phone_number || u?.user_metadata?.phoneNumber;
    }

    const nameA = resInfoA.data?.full_name || "User A";
    const nameB = resInfoB.data?.full_name || "User B";

    // Final Sanity Check - ensure we don't send "undefined" or null
    const finalPhoneA = phoneA || "Contact admin for details";
    const finalPhoneB = phoneB || "Contact admin for details";

    console.log(`[CONTACT_SHARE] Result: ${nameA}=${finalPhoneA}, ${nameB}=${finalPhoneB}`);

    // 2. Send messages to both
    await supabase.from("bond_messages").insert([
      {
        bond_id: bondId,
        sender_id: userId,
        content: `Contact Details Exchanged\n\n${nameA}'s phone: ${finalPhoneA}`,
        is_read: false
      },
      {
        bond_id: bondId,
        sender_id: userId,
        content: `Contact Details Exchanged\n\n${nameB}'s phone: ${finalPhoneB}`,
        is_read: false
      }
    ]);

    // 3. Update Bond
    await supabase
      .from("bonds")
      .update({ is_contact_shared: true })
      .eq("id", bondId);

    return sendSuccess(res, null, "Contact shared successfully");
  } catch (err) {
    console.error("[CONTACT_SHARE_FATAL]", err);
    next(err);
  }
});

module.exports = router;
