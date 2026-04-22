const express = require("express");
const errorPageController = require("../controllers/error-page.controller");

const router = express.Router();

router.get("/404", errorPageController.render404Page);
router.get("/500", errorPageController.render500Page);

module.exports = router;
