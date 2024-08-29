const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: "roomId",
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
    required: true,
  },
});

RoomSchema.statics.incrementSeq = async function () {
  try {
    const room = await this.findByIdAndUpdate(
      { _id: "roomId" },
      {
        $inc: {
          seq: 1,
        },
      },
      { new: true, upsert: true }
    );

    return room.seq;
  } catch (error) {
    throw new Error("Error incrementing roomId");
  }
};

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;
