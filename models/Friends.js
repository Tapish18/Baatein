const mongoose = require("mongoose");
const Room = require("./Room");
const friendsSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "blocked"],
      default: "pending",
    },
    roomId: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);
// friendsSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     this.roomId = await Room.incrementSeq();
//   }
//   next();
// });

const Friend = mongoose.model("Friend", friendsSchema);

module.exports = Friend;
