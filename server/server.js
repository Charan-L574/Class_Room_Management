require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../client"))); // Serve static files from client folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve submission files

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/academics", require("./routes/academics"));

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", ({ room }) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("chatMessage", ({ room, msg }) => {
    io.to(room).emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
