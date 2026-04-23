const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("family");

router.get("/me", authMiddleware, controller.detail);
router.put("/me", authMiddleware, controller.update);

module.exports = router;
