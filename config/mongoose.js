const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URL + "/ChatApp")
  .then(() => {
    console.log("Successfully connected to mongoDB Server");
  })
  .catch((e) => {
    console.log("Error in connect to MongoDB : ", e);
  });

module.exports = mongoose;
