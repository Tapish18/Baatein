const User = require("../models/User");
const Friend = require("../models/Friends");
const Room = require("../models/Room");

async function addFriend(socket, friendId) {
  try {
    const myId = socket.user._id;
    const newFriendInstance = await Friend.create({
      sender: myId,
      receiver: friendId,
    });
    await newFriendInstance.populate("sender", "email profileInfo");
    await newFriendInstance.populate("receiver", "email profileInfo");
    // const formatedFriendInstance = {
    //   ...newFriendInstance._doc,
    //   friend: newFriendInstance.sender,
    // };
    return { data: newFriendInstance, created: true };
  } catch (error) {
    console.log(error);
    return { error, created: false };
  }
}

async function acceptFriendRequest(socket, data) {
  try {
    const myId = socket.user._id;
    const friendId = data;
    const oldFriendInstance = await Friend.findOne({
      sender: friendId,
      receiver: myId,
      roomId: null,
      status: { $in: ["pending", "blocked"] },
    });
    console.log("oldFriendInstance ====>", oldFriendInstance);
    oldFriendInstance.roomId = await Room.incrementSeq();
    oldFriendInstance.status = "active";
    await oldFriendInstance.save();
    return { data: oldFriendInstance, created: true };
  } catch (error) {
    return { error, created: false };
  }
}

module.exports = function (io, socket, userSocketMap) {
  socket.on("addFriend", async (data) => {
    console.log("addFriend called");
    const res = await addFriend(socket, data);
    const dataForOtherSocket = { ...res.data._doc, friend: res.data.sender };
    const dataForSocket = { ...res.data._doc, friend: res.data.receiver };
    if (userSocketMap.get(data)) {
      if (res.created) {
        console.log("addFriend emitted : ", dataForOtherSocket);
        io.to(userSocketMap.get(data)).emit("addFriend", dataForOtherSocket);
      }
      socket.emit("isLive", {
        data: dataForSocket,
        type: "request",
        isLive: true,
        created: res.created,
        ...(res.error ? { error: res.error } : {}),
      });
    } else {
      socket.emit("isLive", {
        data: dataForSocket,
        type: "request",
        isLive: false,
        created: res.created,
        ...(res.error ? { error: res.error } : {}),
      });
    }
  });
  socket.on("acceptFriend", async (data) => {
    const res = await acceptFriendRequest(socket, data);
    if (userSocketMap.get(data)) {
      if (res.created) {
        io.to(userSocketMap.get(data)).emit("friendsMade", res.data);
      }
      socket.emit("isLive", {
        data: res.data,
        type: "acceptRequest",
        isLive: true,
        created: res.created,
        ...(res.error ? { error: res.error } : {}),
      });
    } else {
      socket.emit("isLive", {
        data: res.data,
        type: "acceptRequest",
        isLive: false,
        created: res.created,
        ...(res.error ? { error: res.error } : {}),
      });
    }
  });
};
