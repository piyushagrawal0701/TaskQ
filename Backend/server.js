require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

const projectRouter = require("./routes/projectRoutes");
const taskRouter = require("./routes/taskRoutes");
const messageRouter = require("./routes/messageRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://taskq777.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Database Connected"))
    .catch((error) => console.log("Database Error:", error.message));

// Socket.IO Setup for Real-Time Core
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://taskq777.netlify.app",
    ],
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {

  socket.on("join-team", (room) => {
    socket.join(room);
  });

 socket.on("send-message", (data) => {

  io.emit("receive-message", data);
});
  socket.on("task-change", () => {
    io.emit("task-updated");
  });

  socket.on("disconnect", () => {
  });
});

// Basic Base Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Secured API Route Mounts
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/messages', messageRouter);
app.use('/api/users', userRouter);


const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));