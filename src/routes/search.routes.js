const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("search");

router.get("/profiles", authMiddleware, controller.list);
router.get("/saved", authMiddleware, controller.list);
router.post("/saved", authMiddleware, controller.create);
router.patch("/saved/:id", authMiddleware, controller.update);
router.delete("/saved/:id", authMiddleware, controller.remove);

module.exports = router;
