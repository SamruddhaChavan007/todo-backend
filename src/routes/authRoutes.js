const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const requireAuth = require("../middleware/requireAuth");
const { authLimiter } = require("../middleware/rateLimit")

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", requireAuth, logout);

module.exports = router;