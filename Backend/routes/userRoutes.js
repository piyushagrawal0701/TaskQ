const express = require("express");
const router = express.Router();

const {
  getMe,
  getUsers,
} = require("../controllers/userController.js");

const { protect } = require("../middlewares/authMiddleware.js");

router.get("/", protect, getUsers);

router.get("/me", protect, getMe);

module.exports = router;