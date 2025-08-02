const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// This set will store all the unique IDs that are currently in use.
const usedIds = new Set();

// Function to generate a unique 4-digit ID
const generateUniqueId = () => {
  let id;
  do {
    // Generate a random number between 1000 and 9999
    id = Math.floor(1000 + Math.random() * 9000);
  } while (usedIds.has(id)); // Keep generating until we find a unique one
  usedIds.add(id); // Add the new unique ID to our set
  return id;
};

// Function to remove an ID when a user disconnects
const removeId = (id) => {
  if (id) {
    usedIds.delete(id);
  }
};

// Serve static files from the "public" folder
app.use(express.static("public"));

// Handle socket.io connections
io.on("connection", socket => {
  console.log("New user connected");

  // When a new user joins
  socket.on("new-user", (name) => {
    // Generate a unique ID for this user
    socket.uniqueId = generateUniqueId();
    // Combine the user's name with their new unique ID
    socket.nickname = `${name || "Anonymous"}#${socket.uniqueId}`;
    
    // NEW: Send the unique nickname back to the client that just connected
    socket.emit("your-nickname", socket.nickname);
    
    console.log(`${socket.nickname} joined`);
    io.emit("message", {
      type: "system",
      text: `${socket.nickname} joined the chat`
    });
  });

  // When a message is sent
  socket.on("send-message", msg => {
    // Broadcast the message with the server-assigned nickname and ID
    io.emit("message", {
      type: "chat",
      nickname: socket.nickname, // Use the server-assigned nickname here!
      text: msg.text || "",
      image: msg.image || null
    });
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    console.log(`${socket.nickname || "Someone"} disconnected`);
    io.emit("message", {
      type: "system",
      text: `${socket.nickname || "Someone"} left the chat`
    });
    // Remove the user's ID from our set when they disconnect
    removeId(socket.uniqueId);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});