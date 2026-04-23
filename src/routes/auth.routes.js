const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  return sendSuccess(res, {
    user: req.auth
  });
});

router.post("/session/verify", authMiddleware, (req, res) => {
  return sendSuccess(res, {
    verified: true,
    user: req.auth
  });
});

router.post("/logout", authMiddleware, (req, res) => {
  return sendSuccess(res, {
    loggedOut: true
  });
});

module.exports = router;
