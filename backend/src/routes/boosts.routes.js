const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("boosts");

router.post("/", authMiddleware, controller.create);
router.get("/me", authMiddleware, controller.list);
router.get("/me/stats", authMiddleware, controller.detail);

module.exports = router;
