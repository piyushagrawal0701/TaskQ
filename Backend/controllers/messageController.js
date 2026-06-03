const Message = require('../models/Message.js');
const { messageSchema } = require('../utils/validators.js');

// GET /api/messages?teamId=123
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("senderId", "name email")
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    const newMessage = await Message.create({
      content,
      senderId: req.user._id,
    });

    await newMessage.populate("senderId", "name email");

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


// DELETE - CLEAR CHAT

exports.clearMessages = async (req, res) => {
  try {
    await Message.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All messages deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};