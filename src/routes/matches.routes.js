const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("matches");

router.get("/", authMiddleware, controller.list);
router.post("/refresh", authMiddleware, controller.create);
router.get("/:matchId", authMiddleware, controller.detail);
router.post("/:matchId/feedback", authMiddleware, controller.create);

module.exports = router;
