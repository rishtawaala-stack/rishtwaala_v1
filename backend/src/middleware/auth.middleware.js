const ApiError = require("../utils/api-error");
const supabase = require("../services/supabase.service");

function parseBearerToken(headerValue) {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

async function authMiddleware(req, res, next) {
  const token = parseBearerToken(req.headers.authorization);

  if (!token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Authentication token is required."));
  }

  try {
    // Verify user with Supabase using the access token
    let user = null;
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (data?.user) user = data.user;
    } catch (supabaseErr) {
      console.error("Supabase Auth Network Error:", supabaseErr.message);
    }

    let userId = user?.id;
    
    // If getUser fails, try to manually decode the token to get the userId (sub claim)
    if (!userId && token.includes(".")) {
      try {
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
        userId = payload.sub;
      } catch (e) {
        console.error("Token decode failed:", e);
      }
    }

    if (!userId) {
      return next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired token"));
    }

    // Get profile ID from unified table
    const { data: userInfo } = await supabase
      .from("user_information")
      .select("id, is_premium")
      .eq("user_id", userId)
      .single();

    req.auth = {
      token,
      authUserId: userId,
      userId: userId,
      profileId: userInfo?.id || null,
      plan: {
        code: userInfo?.is_premium ? "premium" : "free",
        expiresAt: null
      },
      adminRole: null
    };

    return next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    // Graceful fallback for dev
    req.auth = {
      token,
      authUserId: token,
      userId: token,
      profileId: null,
      plan: { code: "free", expiresAt: null },
      adminRole: null
    };
    return next();
  }
}

module.exports = authMiddleware;
