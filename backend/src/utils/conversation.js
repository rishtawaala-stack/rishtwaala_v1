const supabase = require("../services/supabase.service");

async function checkConversationDepth(bondId, profileA, profileB) {
  try {
    // 1. Fetch total message_count from bonds (fast lookup)
    const { data: bond, error: bondErr } = await supabase
      .from("bonds")
      .select("message_count, is_unlocked")
      .eq("id", bondId)
      .single();

    if (bondErr || !bond) {
        console.error("Bond not found for depth check:", bondId);
        return { eligible: false };
    }

    // If already unlocked, no need to check further
    if (bond.is_unlocked) {
        return { eligible: false, alreadyUnlocked: true };
    }

    // 2. Optimization: only count if total is near or above 20
    // We use >= 20 because the update might have happened just before this call
    if (bond.message_count < 1) {
      return { eligible: false };
    }

    // 3. Dynamically compute per-user message count from messages table
    const { data: messages, error: msgErr } = await supabase
      .from("bond_messages")
      .select("sender_id")
      .eq("bond_id", bondId);

    if (msgErr || !messages) {
        console.error("Error fetching messages for depth check:", msgErr);
        return { eligible: false };
    }

    const messagesFromA = messages.filter(m => m.sender_id === profileA).length;
    const messagesFromB = messages.filter(m => m.sender_id === profileB).length;
    const totalMessages = messages.length;

    const eligible = totalMessages >= 1;

    return {
      eligible,
      counts: { totalMessages, messagesFromA, messagesFromB }
    };
  } catch (error) {
    console.error("checkConversationDepth Error:", error);
    return { eligible: false };
  }
}

module.exports = { checkConversationDepth };
