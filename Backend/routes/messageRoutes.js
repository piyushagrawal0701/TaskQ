const express = require("express");
const messageRouter = express.Router();
const { protect } = require("../middlewares/authMiddleware.js");
const {
  getMessages,
  sendMessage,
  clearMessages,
} = require("../controllers/messageController.js");

// All message routes require authentication
messageRouter.use(protect);

messageRouter.route("/").get(getMessages).post(sendMessage);

messageRouter.delete("/clear", clearMessages);

module.exports = messageRouter;
