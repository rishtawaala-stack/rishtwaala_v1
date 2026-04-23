const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("contacts");

router.post("/unlock", authMiddleware, controller.create);
router.get("/unlocks/me", authMiddleware, controller.list);

module.exports = router;
