const socket = io();

socket.on("hello", (args) => {
  console.log(args);
});

const btn = document.getElementById("btn");
btn.onclick = function exec() {
  socket.emit("fromClient", "Hiiiiiiiii!");
};

socket.on("fromServer", (val) => {
  console.log(val);
});
