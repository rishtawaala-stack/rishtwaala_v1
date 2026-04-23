const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("subscriptions");

router.get("/plans", controller.list);
router.get("/me", authMiddleware, controller.detail);
router.post("/checkout", authMiddleware, controller.create);
router.post("/activate", authMiddleware, controller.create);
router.post("/cancel", authMiddleware, controller.update);

module.exports = router;
