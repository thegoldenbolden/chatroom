// @ts-nocheck
import { NextApiRequest } from "next";
import { Server } from "socket.io";

export default function SocketHandler(req: NextApiRequest, res: any) {
  // If socket is already initialized then don't go any further.
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  const onConnection = (socket: any) => {
    socket.on("send-message", (message, room) => {
      // Send to specified room or broadcast to all room.
      if (room === "") {
        socket.broadcast.emit("incoming-message", message);
      } else {
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
  res.end();
}
