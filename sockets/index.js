const JWTSocketMiddleware = require("../middleswares/jwtMiddlewareSocket");
const userController = require("./userController");
const messageControler = require("./messageController");
module.exports = (server, options) => {
  const io = require("socket.io")(server, options);
  const userSocketMap = new Map();
  io.use(JWTSocketMiddleware);

  io.on("connection", (socket) => {
    console.log("socket connected : ", socket.id);
    userSocketMap.set(socket.user._id, socket.id);
    console.log(userSocketMap);

    userController(io, socket, userSocketMap);
    messageControler(io, socket, userSocketMap);
  });
};
