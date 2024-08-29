const mongoose = require("mongoose");
const Room = require("./Room");
const groupSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groupName: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  roomId: {
    type: Number,
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

groupSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.roomId = await Room.incrementSeq();
  }
  next();
});

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
