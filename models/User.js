const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isProfileSetup: {
      type: Boolean,
      default: false,
    },
    profileInfo: {
      username: {
        type: String,
      },
      profilePhoto: {
        type: String,
      },
      about: {
        type: String,
      },
      status: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function setUserName(next) {
  if (!this.profileInfo.username) {
    this.profileInfo.username = this.fullName;
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
