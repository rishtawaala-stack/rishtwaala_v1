const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("notifications");

router.get("/", authMiddleware, controller.list);
router.post("/:id/read", authMiddleware, controller.update);
router.post("/read-all", authMiddleware, controller.update);

module.exports = router;
