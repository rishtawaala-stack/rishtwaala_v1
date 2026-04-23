const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminAuthMiddleware = require("../middleware/admin-auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("relationship-managers");

router.get("/me/clients", authMiddleware, adminAuthMiddleware, controller.list);
router.patch("/assignments/:id", authMiddleware, adminAuthMiddleware, controller.update);

module.exports = router;
