const supabase = require("../services/supabase.service");
const ApiError = require("../utils/api-error");

async function adminSessionMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "UNAUTHORIZED", "Admin token required"));
  }

  const token = authHeader.split(" ")[1];
  
  if (!token.startsWith("admin_tok_")) {
    return next(new ApiError(401, "UNAUTHORIZED", "Invalid admin token format"));
  }

  const adminId = token.replace("admin_tok_", "");

  try {
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", adminId)
      .eq("is_active", true)
      .single();

    if (error || !admin) {
      return next(new ApiError(401, "UNAUTHORIZED", "Admin session invalid or expired"));
    }

    // Populate req.auth to satisfy subsequent middlewares or controllers
    req.auth = {
      token,
      userId: admin.id,
      adminId: admin.id,
      role: admin.role,
      name: admin.name
    };

    // Also populate x-admin-role header behavior if needed
    if (!req.headers["x-admin-role"]) {
      req.headers["x-admin-role"] = admin.role;
    }

    return next();
  } catch (err) {
    console.error("Admin session middleware error:", err);
    return next(new ApiError(500, "SERVER_ERROR", "Internal security error"));
  }
}

module.exports = adminSessionMiddleware;
