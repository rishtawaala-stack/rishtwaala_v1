const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("profiles");

router.post("/", authMiddleware, controller.create);
router.get("/me", authMiddleware, controller.detail);
router.patch("/me", authMiddleware, controller.update);
router.post("/me/activate", authMiddleware, controller.update);
router.post("/me/deactivate", authMiddleware, controller.update);
router.get("/me/completeness", authMiddleware, controller.detail);
router.get("/:profileId", authMiddleware, controller.detail);
router.get("/:profileId/horoscope", authMiddleware, controller.detail);
router.get("/:profileId/media", authMiddleware, controller.detail);
router.post("/:profileId/view", authMiddleware, controller.create);

module.exports = router;
