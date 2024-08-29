const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../config/multerConfig");

router.post("/auth/signUp", userController.userSignUp);
router.post("/auth/signIn", userController.userSignIn);
router.get("/getUserInfo", userController.getUserInfo);
router.post("/updateProfile", userController.updateProfile);
router.get("/getUsers", userController.searchUsers);
router.post("/addFriend", userController.addFriend);
router.post("/acceptFriendRequest", userController.acceptFriendRequest);
router.get("/getChatsInfo", userController.getChatsInfo);
// router.post("/temp", userController.tempFunction);

module.exports = router;
