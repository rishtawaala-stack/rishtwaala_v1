const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("media");

router.post("/upload-url", authMiddleware, controller.create);
router.post("/", authMiddleware, controller.create);
router.patch("/:mediaId", authMiddleware, controller.update);
router.delete("/:mediaId", authMiddleware, controller.remove);

module.exports = router;
