const User = require("../models/User");

const getMe = async (req, res) => {
  res.json(req.user);
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getMe,
  getUsers,
};