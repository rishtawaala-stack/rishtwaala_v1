const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("horoscope");

router.get("/", authMiddleware, controller.list);
router.post("/", authMiddleware, controller.create);
router.get("/:id", authMiddleware, controller.detail);
router.patch("/:id", authMiddleware, controller.update);
router.delete("/:id", authMiddleware, controller.remove);

module.exports = router;
