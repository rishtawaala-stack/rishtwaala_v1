const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("payments");

router.post("/webhooks/razorpay", controller.create);
router.post("/webhooks/stripe", controller.create);
router.get("/me", authMiddleware, controller.list);

module.exports = router;
