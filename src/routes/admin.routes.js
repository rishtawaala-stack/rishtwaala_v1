const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminAuthMiddleware = require("../middleware/admin-auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("admin");

router.use(authMiddleware, adminAuthMiddleware);

router.get("/dashboard", controller.detail);
router.get("/profiles/screening", controller.list);
router.patch("/profiles/screening/:id", controller.update);
router.get("/reports", controller.list);
router.patch("/reports/:id", controller.update);
router.get("/verifications", controller.list);
router.patch("/verifications/:id", controller.update);
router.post("/users", controller.create);
router.get("/audit-logs", controller.list);
router.post("/profiles/:profileId/block", controller.create);
router.post("/profiles/:profileId/unblock", controller.create);
router.post("/success-stories", controller.create);
router.patch("/success-stories/:id", controller.update);

module.exports = router;
