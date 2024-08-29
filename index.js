require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const routes = require("./routes");
const mongoose = require("./config/mongoose");
const JWTMiddleware = require("./middleswares/jwtMiddleware");
const socketServer = require("./sockets/index");
const PORT = 4000;

const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(JWTMiddleware);

app.use("/api", routes);

const httpServer = http.createServer(app);

socketServer(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Add http:// or https:// based on your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.use("/", express.static(__dirname + "/public"));

httpServer.listen(PORT, (e) => {
  console.log("Server Started Sucessfully");
});
