const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("users");

router.get("/me", authMiddleware, controller.detail);
router.patch("/me", authMiddleware, controller.update);
router.delete("/me", authMiddleware, controller.remove);

module.exports = router;
