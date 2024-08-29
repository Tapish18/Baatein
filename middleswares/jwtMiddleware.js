const jwt = require("jsonwebtoken");

const JWTMiddleware = function (req, res, next) {
  if (
    req.path == "/api/auth/signUp" ||
    req.path == "/api/auth/signIn" ||
    req.path == "/api/temp"
  ) {
    next();
  } else {
    // console.log("called");
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid Token",
          error: err,
        });
      } else {
        // console.log("decoded ===>", decoded);
        req.tokenInfo = decoded;
        next();
      }
    });
    //verify the JWT token
  }
};

module.exports = JWTMiddleware;
