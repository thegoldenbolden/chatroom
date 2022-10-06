// @ts-nocheck
import { NextApiRequest } from "next";
import { Server } from "socket.io";

export default function SocketHandler(req: NextApiRequest, res: any) {
  // If socket is already initialized then don't go any further.
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  const onConnection = (socket: any) => {
    console.log("Connected with id: ", socket.id);
    socket.on("send-message", (message, room) => {
      // Send to specified room or broadcast to all room.
      if (room === "") {
        console.log("Broadcasting message to all rooms");
        socket.broadcast.emit("incoming-message", message);
      } else {
        console.log("Sending message to room:", room);
        socket.to(room).emit("incoming-message", message);
      }
    });

    socket.on("join-room", (room, callback) => {
      socket.join(room);
      callback && callback();
    });

    socket.on("get-users", (room, callback) => {
      callback(io.sockets.adapter.rooms.get(room).size);
    });

    socket.on("leave-room", (room, userId, userName, callback = () => {}) => {
      socket.leave(room);
      socket.leave(userId);
      socket.emit("incoming-message", { author: "Noodle", content: userName + " has left the room." });
      callback();
    });
  };

  // Define actions inside
  io.on("connection", onConnection);
  console.log("Setting up socket");
  res.end();
}
