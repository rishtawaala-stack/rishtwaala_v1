const express = require("express");
const { createResourceController } = require("../controllers/resource.controller");

const router = express.Router();
const controller = createResourceController("public");

router.get("/success-stories", controller.list);
router.get("/plans", controller.list);
router.get("/communities/:slug", controller.detail);

module.exports = router;
