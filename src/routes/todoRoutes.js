const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// All routes below REQUIRE authentication
router.use(requireAuth);

router.get("/", (req, res) => {
  res.json({
    message: "Authenticated",
    userId: req.userId
  });
});

module.exports = router;