const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("conversations");

router.get("/", authMiddleware, controller.list);
router.post("/", authMiddleware, controller.create);
router.get("/:conversationId", authMiddleware, controller.detail);
router.patch("/:conversationId", authMiddleware, controller.update);
router.get("/:conversationId/messages", authMiddleware, controller.list);
router.post("/:conversationId/messages", authMiddleware, controller.create);

module.exports = router;
