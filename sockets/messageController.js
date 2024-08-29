const Message = require("../models/Message");

async function createMessage(socket, roomId, message) {
  try {
    const newMessage = await Message.create({
      creator: socket.user._id,
      roomId: roomId,
      content: message,
    });
    return { data: newMessage, created: true };
  } catch (error) {
    return { error, created: false };
  }
}

async function updateMessageSeen(roomId, updatedAt) {
  try {
    let myNewMessages = await Message.find({
      roomId: roomId,
      status: "delivered",
      // updatedAt: updatedAt,
    });
    const newMessages = myNewMessages.map((val, idx, arr) => {
      return { ...val._doc, status: "seen", updatedAt: updatedAt };
    });
    const dbMessages = await Message.updateMany(
      {
        roomId: roomId,
        status: "delivered",
      },
      {
        status: "seen",
        updatedAt: updatedAt,
      }
    );

    return { data: newMessages, updated: true };
  } catch (error) {
    console.log(error);
    return { error, updated: false };
  }
}

async function updateMessageDelivered(_id, updatedAt) {
  try {
    const message = await Message.findOne({
      _id: _id,
    });
    const myMessage = await Message.updateOne(
      {
        _id: _id,
      },
      { status: "delivered", updatedAt: updatedAt }
    );
    let messageToBeSent = {
      ...message._doc,
      status: "delivered",
      updatedAt: updatedAt,
    };
    return { data: messageToBeSent, updated: true };
  } catch (error) {
    console.log(error);
    return { error, updated: false };
  }
}

module.exports = function (io, socket, userSocketMap) {
  socket.on("joinRooms", (data) => {
    console.log(socket.user._id, " : ", data);
    data.forEach((element) => {
      socket.join(element);
    });
  });

  socket.on("message", async ({ roomId, message }) => {
    const res = await createMessage(socket, roomId, message);
    if (res.created) {
      io.to(roomId).emit("message", res);
    } else {
      socket.emit("messageRes", res);
    }
  });

  socket.on("messageSeen", async (data) => {
    const res = await updateMessageSeen(data.roomId, data.updatedAt);
    if (res.updated) {
      socket.to(data.roomId).emit("messageSeen", res.data);
    }
  });

  socket.on("messageDelivered", async (data) => {
    const res = await updateMessageDelivered(data._id, data.updatedAt);
    if (res.updated) {
      socket.to(data.roomId).emit("messageDelivered", res); // going to the creator
    }
  });
};
