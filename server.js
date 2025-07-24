const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", socket => {
  socket.on("new-user", name => {
    socket.nickname = name;
    io.emit("message", { type: "system", text: `${name} joined the chat` });
  });

  socket.on("send-message", msg => {
    io.emit("message", {
      type: "chat",
      nickname: msg.nickname,
      text: msg.text
    });
  });

  socket.on("disconnect", () => {
    io.emit("message", { type: "system", text: `${socket.nickname || "Someone"} left the chat` });
  });
});

http.listen(3000, () => {
  console.log("Chat running at http://localhost:3000");
});