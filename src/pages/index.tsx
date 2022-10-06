import { useRouter } from "next/router";
import { useState } from "react";
import { io } from "socket.io-client";

const Home = () => {
  const router = useRouter();
  const [room, setRoom] = useState<string>("");

  function createRoom() {
    const r = "abcdefghijklmnopqrstuvwxyz0123456789";
    let newRoom = "";
    for (let i = 0; i < 8; i++) {
      newRoom += r[~~(Math.random() * r.length)];
    }
    return newRoom;
  }

  async function joinRoom(e: any) {
    e.preventDefault();

    if (room.length === 8) {
      router.push({ pathname: "/room/[id]", query: { id: room.toLowerCase() } });
      return;
    }

    router.push({ pathname: "/room/[id]", query: { id: createRoom() } });
    return;
  }

  return (
    <div className="grid w-screen font-mono h-screen bg-gradient-to-br from-zinc-500 to-rose-500 gap-2 place-content-center">
      <h1 className="w-full p-2 bg-white/10 rounded-md shadow-sm shadow-rose-100 text-white text-center text-xl">
        Chat App
      </h1>
      <form
        className="flex flex-col justify-center items-center gap-4 p-4 shadow-sm shadow-rose-100 bg-white/20 rounded-md"
        onSubmit={joinRoom}
      >
        <div className="flex flex-wrap gap-2">
          <input
            className="bg-transparent px-2 placeholder:text-white text-white caret-white border-b-solid border-b-2 focus-within:outline-none"
            placeholder="Join room"
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button
            className="bg-white hover:filter-none hover:shadow-black/25 hover:shadow-inner drop-shadow-lg rounded-md px-4"
            type="submit"
          >
            Join
          </button>
        </div>
        <button
          className="flex-grow w-full py-2 text-black bg-white rounded  hover:filter-none hover:shadow-black/25 hover:shadow-inner drop-shadow-lg h-max"
          type="submit"
        >
          Create Room
        </button>
      </form>
    </div>
  );
};

export default Home;
