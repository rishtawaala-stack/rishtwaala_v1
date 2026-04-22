const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("interests");

router.get("/incoming", authMiddleware, controller.list);
router.get("/outgoing", authMiddleware, controller.list);
router.post("/", authMiddleware, controller.create);
router.patch("/:id", authMiddleware, controller.update);

module.exports = router;
