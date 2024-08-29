const jwt = require("jsonwebtoken");

const JWTMiddlewareSocket = (socket, next) => {
  const token = socket.handshake?.auth?.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log("error occurred : ", err);
        socket.emit("error", err);
      } else {
        socket.user = decoded;

        next();
      }
    });
  } else {
    socket.emit("error", "Token Absent");
  }
};

module.exports = JWTMiddlewareSocket;
