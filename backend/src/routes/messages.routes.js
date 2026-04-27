const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("bond_messages");

router.post("/:messageId/read", authMiddleware, controller.update);

module.exports = router;
