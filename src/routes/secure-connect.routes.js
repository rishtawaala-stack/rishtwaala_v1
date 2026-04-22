const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("secure-connect");

router.post("/sessions", authMiddleware, controller.create);
router.get("/sessions", authMiddleware, controller.list);
router.patch("/sessions/:id", authMiddleware, controller.update);

module.exports = router;
