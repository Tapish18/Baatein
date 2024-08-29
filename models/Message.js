const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: Number,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "audio"],
      default: "text",
      required: true,
    },
    content: {
      type: String,
    },
    status: {
      type: String,
      enum: ["created", "delivered", "seen"], // created - singe tick, delivered-double tick, seen-double blue tick
      default: "created",
      required: true,
    },
    messageChannel: {
      type: String,
      enum: ["friend", "group"],
      default: "friend",
      required: true,
    },
  },
  { timestamps: true }
);

messageSchema.pre("save", function (next) {
  if (this.messageType === "text" && !this.content) {
    const error = new Error("Content is required for text messages");
    return next(error);
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
