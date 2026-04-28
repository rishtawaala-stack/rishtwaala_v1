const supabase = require("../services/supabase.service");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/api-error");

const adminController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ApiError(400, "VALIDATION_ERROR", "Email and password are required."));
      }

      const { data, error } = await supabase.rpc("verify_admin_password", {
        p_email: email,
        p_password: password
      });

      if (error) {
        console.error("Admin verification error:", error);
        return next(new ApiError(500, "SERVER_ERROR", "Authentication system error."));
      }

      if (!data || data.length === 0) {
        return next(new ApiError(401, "AUTH_ERROR", "Invalid administrative credentials."));
      }

      const admin = data[0];
      const adminToken = `admin_tok_${admin.id}`;

      return sendSuccess(res, {
        token: adminToken,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (err) {
      console.error("Admin login error:", err);
      return next(new ApiError(500, "SERVER_ERROR", "Internal server error during admin login."));
    }
  },

  getStats: async (req, res, next) => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from("user_information")
        .select("*", { count: 'exact', head: true });

      // Fetch pending verifications
      const { count: pendingVerif } = await supabase
        .from("verifications")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending");

      // Fetch Gender Distribution
      const { data: genderData } = await supabase
        .from("user_information")
        .select("gender");
      
      const genderCounts = {
        male: genderData.filter(u => u.gender === 'male').length,
        female: genderData.filter(u => u.gender === 'female').length,
        other: genderData.filter(u => u.gender !== 'male' && u.gender !== 'female').length
      };

      // Fetch Registration History (last 6 months)
      const { data: historyData } = await supabase
        .from("user_information")
        .select("created_at");
      
      const monthMap = {};
      const last6Months = Array.from({length: 6}, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString('default', { month: 'short' });
      }).reverse();

      last6Months.forEach(m => monthMap[m] = 0);
      
      historyData.forEach(u => {
        const m = new Date(u.created_at).toLocaleString('default', { month: 'short' });
        if (monthMap.hasOwnProperty(m)) monthMap[m]++;
      });

      const registrationHistory = last6Months.map(m => ({ month: m, count: monthMap[m] }));

      const stats = {
        totalUsers: userCount || 0,
        mrr: 142850,
        pendingVerifications: pendingVerif || 0,
        genderDistribution: genderCounts,
        registrationHistory: registrationHistory
      };

      return sendSuccess(res, stats);
    } catch (err) {
      console.error("Failed to fetch real stats:", err);
      return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch dashboard stats."));
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from("user_information")
        .select("id, user_id, full_name, created_at, profile_complete_pct, gender");

      if (error) throw error;
      return sendSuccess(res, data);
    } catch (err) {
      return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch users."));
    }
  },

  createQuestion: async (req, res, next) => {
    try {
      const { question_text, is_all_users, user_ids } = req.body;
      const adminId = req.auth.adminId;

      const { data: question, error: qError } = await supabase
        .from("admin_questions")
        .insert({
          question_text,
          is_all_users,
          created_by: adminId
        })
        .select()
        .single();

      if (qError) throw qError;

      if (!is_all_users && user_ids && user_ids.length > 0) {
        const targets = user_ids.map(uid => ({
          question_id: question.id,
          user_id: uid
        }));
        const { error: tError } = await supabase
          .from("admin_question_targets")
          .insert(targets);
        if (tError) throw tError;
      }

      return sendSuccess(res, question, "Question created and sent successfully.");
    } catch (err) {
      console.error("Create question error:", err);
      return next(new ApiError(500, "SERVER_ERROR", "Failed to create questionnaire."));
    }
  },

  getAnswers: async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from("admin_question_answers")
        .select(`
          id,
          answer_text,
          created_at,
          user_id,
          user_information!inner (full_name),
          admin_questions (question_text)
        `);

      if (error) throw error;
      return sendSuccess(res, data);
    } catch (err) {
      console.error("Fetch answers error details:", err);
      return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch answers."));
    }
  },

  getVerifications: async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from("verifications")
        .select(`
          *,
          user_information:user_id (full_name)
        `);

      if (error) throw error;
      return sendSuccess(res, data);
    } catch (err) {
      return next(new ApiError(500, "SERVER_ERROR", "Failed to fetch verifications."));
    }
  }
};

module.exports = adminController;
