const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("../models/User");
const Friend = require("../models/Friends");
const Room = require("../models/Room");
const Message = require("../models/Message");
const createHashedPassword =
  require("../helper/helperFunctions").createHashedPassword;

const userSignUp = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    let hashedPassword = await createHashedPassword(password);
    const newUser = await user.create({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });
    console.log("user created Successfully : ", newUser);
    return res.status(200).send({
      msg: "User Created Successfully",
    });
  } catch (error) {
    console.log("Error Occurred : ", error);
    return res.status(400);
  }
};

const userSignIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const oldUser = await user.findOne({ email: email });
    if (oldUser) {
      const hashedPassVerdict = await bcrypt.compare(
        password,
        oldUser.password
      ); // Returns bool value;
      if (hashedPassVerdict) {
        // create the JWT TOKEN
        const token = jwt.sign(
          { _id: oldUser._id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "6h",
          }
        );
        return res.status(200).json({
          msg: "Successfull SignIn",
          token: token,
        });
      } else {
        return res.status(200).send({
          msg: "Invalid Username/Password",
        });
      }
    } else {
      return res.status(200).send({
        msg: "Invalid Username/Password",
      });
    }
  } catch (error) {
    console.log("Error Occurred : ", error);
  }
};

const getUserInfo = async (req, res) => {
  const tokenInfo = req.tokenInfo;
  try {
    if (tokenInfo) {
      const oldUser = await user.findById(tokenInfo._id, {
        profileInfo: 1,
        email: 1,
        isProfileSetup: 1,
        fullName: 1,
      });
      if (oldUser) {
        return res.status(200).json({
          userInfo: oldUser,
        });
      } else {
        return res.status(401).json({
          message: "Unauthorised User",
        });
      }
    }
  } catch (error) {
    return res.status(400).json({
      error: error,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const oldUser = await user.findOne({ _id: req.tokenInfo._id });
    if (oldUser) {
      // const profilePhoto = req.file.path;
      const { profilePhoto, username, about, status } = req.body;
      console.log({ profilePhoto, username, about, status });
      const updatedUser = await user.updateOne(
        { _id: req.tokenInfo._id },
        {
          profileInfo: {
            username,
            about,
            status,
            profilePhoto,
          },
          isProfileSetup: true,
        }
      );
      console.log("User Updated Successfully");
      return res.status(200).json({
        message: "Data Recieved",
        data: updatedUser,
      });
    }
    return res.status(200).json({
      message: "User Not Found",
    });
  } catch (error) {
    return res.status(400).json({
      error: error,
    });
  }
};

const searchUsers = async function (req, res) {
  try {
    const searchText = req.query.searchText;
    const regex = new RegExp(searchText, "i");
    const userFriends = await Friend.find(
      {
        $or: [{ sender: req.tokenInfo._id }, { receiver: req.tokenInfo._id }],
      },
      { sender: 1, receiver: 1, _id: 0 }
    );
    const filteredUserFriends = userFriends.map((val) => {
      if (val.sender == req.tokenInfo._id) {
        return val.receiver;
      }
      return val.sender;
    });
    const query = {
      $and: [
        {
          $or: [{ "profileInfo.username": regex }, { email: regex }],
        },
        {
          _id: {
            $not: { $in: [req.tokenInfo._id, ...filteredUserFriends] },
          },
        },
      ],
    };
    const possibleUsers = await user
      .find(query)
      .select(["_id", "profileInfo", "email"]);

    return res.status(200).json({
      message: "get request successfull",
      data: possibleUsers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const addFriend = async function (req, res) {
  try {
    const { userId } = req.body;
    const sendersId = req.tokenInfo._id;
    const friendInstance = await Friend.create({
      sender: sendersId,
      receiver: userId,
    });
    return res.status(200).json({
      message: "Request sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const acceptFriendRequest = async function (req, res) {
  try {
    const { sendersId } = req.body;
    console.log("sendersId====>", sendersId);
    console.log(req.body);
    const myId = req.tokenInfo._id;
    const friendInstance = await Friend.findOne({
      $and: [
        { $and: [{ sender: sendersId }, { receiver: myId }] },
        {
          roomId: null,
        },
        {
          $or: [{ status: "pending" }, { status: "blocked" }],
        },
      ],
    });
    console.log("friendInstance", friendInstance);
    if (friendInstance) {
      friendInstance.roomId = await Room.incrementSeq();
      friendInstance.status = "active";
      await friendInstance.save();
      return res.status(200).json({
        message: "Friend request accepted successfully",
      });
    } else {
      return res.status(400).json({
        message: "Instance not found or Already a friend",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getChatsInfo = async function (req, res) {
  try {
    const myId = req.tokenInfo._id;
    let acceptedFriends = await Friend.find({
      $and: [
        {
          $or: [{ sender: myId }, { receiver: myId }],
        },
        {
          status: "active",
        },
      ],
    })
      .populate("sender", "profileInfo email")
      .populate("receiver", "profileInfo email");
    // acceptedFriends.forEach(async (ele, idx, arr) => {
    //   const eleMessages = await Message.find({
    //     roomId: ele.roomId,
    //   });
    //   arr[idx]._doc.messages = eleMessages || [];
    // });
    let roomIds = acceptedFriends.map((ele) => {
      return ele.roomId;
    });

    const friendsMessages = await Message.find({
      roomId: {
        $in: roomIds,
      },
      messageChannel: "friend",
    }).sort({ createdAt: -1 });

    acceptedFriends.map((ele, idx, arr) => {
      let roomId = ele.roomId;
      const roomMessages = friendsMessages.filter((ele) => {
        return ele.roomId == roomId;
      });
      arr[idx]._doc.messages = roomMessages || [];
    });

    const formatedAcceptedFriends = acceptedFriends.map((val, idx, obj) => {
      if (val.sender._id == myId) {
        return {
          ...val._doc,
          sender: undefined,
          friend: val.receiver,
          receiver: undefined,
        };
        // val.sender = undefined;
        // val.friend = val.receiver;
        // val.receiver = undefined;
      } else {
        return {
          ...val._doc,
          receiver: undefined,
          friend: val.sender,
          sender: undefined,
        };
        // val.receiver = undefined;
        // val.friend = val.sender;
        // val.sender = undefined;
      }
    });

    const pendingFriends = await Friend.find({
      sender: myId,
      status: "pending",
    }).populate("receiver", "profileInfo email");
    const formatedPendingFriends = pendingFriends.map((val, idx, obj) => {
      return {
        ...val._doc,
        friend: val.receiver,
        receiver: undefined,
      };
      // val.friend = val.receiver;
      // val.receiver = undefined;
    });

    const requestLists = await Friend.find({
      receiver: myId,
      status: "pending",
    }).populate("sender", "profileInfo email");
    const formatedRequestList = requestLists.map((val, idx, obj) => {
      return {
        ...val._doc,
        friend: val.sender,
        sender: undefined,
      };
      // val.friend = val.sender;
      // val.sender = undefined;
    });

    const data = {
      friendList: formatedAcceptedFriends,
      pendingFriends: formatedPendingFriends,
      requestLists: formatedRequestList,
    };

    return res.status(200).json({
      message: "Api hit succesfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
};

module.exports = {
  userSignUp,
  userSignIn,
  getUserInfo,
  updateProfile,
  searchUsers,
  addFriend,
  acceptFriendRequest,
  getChatsInfo,
};
