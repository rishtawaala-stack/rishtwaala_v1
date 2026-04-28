const express = require("express");
const adminSessionMiddleware = require("../middleware/admin-session.middleware");
const adminController = require("../controllers/admin.controller");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("admin");

// Public admin login
router.post("/login", adminController.login);

// Protected routes using custom admin session middleware
router.get("/dashboard-stats", adminSessionMiddleware, adminController.getStats);
router.get("/users", adminSessionMiddleware, adminController.getAllUsers);

// Questionnaire routes
router.post("/questions", adminSessionMiddleware, adminController.createQuestion);
router.get("/questions/answers", adminSessionMiddleware, adminController.getAnswers);
router.get("/verifications-list", adminSessionMiddleware, adminController.getVerifications);

router.get("/dashboard", adminSessionMiddleware, controller.detail);
router.get("/profiles/screening", adminSessionMiddleware, controller.list);
router.patch("/profiles/screening/:id", adminSessionMiddleware, controller.update);
router.get("/reports", adminSessionMiddleware, controller.list);
router.patch("/reports/:id", adminSessionMiddleware, controller.update);
router.get("/verifications", adminSessionMiddleware, controller.list);
router.patch("/verifications/:id", adminSessionMiddleware, controller.update);
router.post("/users", adminSessionMiddleware, controller.create);
router.get("/audit-logs", adminSessionMiddleware, controller.list);
router.post("/profiles/:profileId/block", adminSessionMiddleware, controller.create);
router.post("/profiles/:profileId/unblock", adminSessionMiddleware, controller.create);
router.post("/success-stories", adminSessionMiddleware, controller.create);
router.patch("/success-stories/:id", adminSessionMiddleware, controller.update);

module.exports = router;
