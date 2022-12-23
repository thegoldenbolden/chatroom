import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

app.get("/api/rooms", (req, res) => {
 const rooms: any[] = [];
 res.send(rooms);
});

io.on("connect", (socket) => {
 console.log("A user connected");

 socket.on("disconnect", () => {
  console.log("A user disconnected.");
 });
});

server.listen(3000, () => {
 console.log(`Listening on port: ${PORT}`);
});
