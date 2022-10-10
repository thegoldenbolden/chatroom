import { useRouter } from "next/router";
import { useState } from "react";
import { createRoom } from "../lib/createRoom";

const Home = () => {
  const router = useRouter();
  const [room, setRoom] = useState<string>("");

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
    <div className="grid w-screen h-screen gap-2 font-mono bg-gradient-to-br from-zinc-500 to-rose-500 place-content-center">
      <h1 className="w-full p-2 text-xl text-center text-white rounded-md shadow-sm bg-white/10 shadow-rose-100">
        Chat App
      </h1>
      <form
        className="flex flex-col items-center justify-center gap-4 p-4 rounded-md shadow-sm shadow-rose-100 bg-white/20"
        onSubmit={joinRoom}
      >
        <div className="flex flex-wrap gap-2">
          <input
            className="px-2 text-white bg-transparent border-b-2 placeholder:text-white caret-white border-b-solid focus-within:outline-none"
            placeholder="Join room"
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button
            className="px-4 bg-white rounded-md hover:filter-none hover:shadow-black/25 hover:shadow-inner drop-shadow-lg"
            type="submit"
          >
            Join
          </button>
        </div>
        <button
          className="flex-grow w-full py-2 text-black bg-white rounded hover:filter-none hover:shadow-black/25 hover:shadow-inner drop-shadow-lg h-max"
          type="submit"
        >
          Create Room
        </button>
      </form>
    </div>
  );
};

export default Home;
