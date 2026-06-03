const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "MEMBER"],
      default: "MEMBER",
    },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", },
    firebaseUid: { type: String, required: true, unique: true }, // Crucial for linking Firebase Auth
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
