import io, { Socket } from "socket.io-client";
import { useState, useEffect, useCallback, FC, PropsWithChildren, KeyboardEvent } from "react";
import { useRouter } from "next/router";
let socket: Socket;

type SendMessage = { author: User; room: string; sendMessage: any };
const SendMessage: FC<SendMessage> = ({ author, room, sendMessage }) => {
  const [message, setMessage] = useState("");

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == "Enter") {
      if (message.length > 0) {
        sendMessage({ author: author.name, content: message, color: author.color }, room);
        setMessage("");
      }
    }
  };

  return (
    <div className="flex flex-wrap w-full border-t border-gray-300 rounded-bl-md">
      <textarea
        spellCheck={true}
        placeholder="New message..."
        value={message}
        className="outline-none bg-transparent text-white placeholder-white py-2 px-2 min-h-[2.5rem] w-full rounded-bl-md flex-1"
        onChange={(e) => setMessage(e.target.value)}
        onKeyUp={handleKeyPress}
      />
      <div className="items-center justify-center text-white transition-all border-l border-black/25 rounded-br-md group hover:bg-black">
        <button
          className="h-full px-3 text-white"
          onClick={() => {
            sendMessage({ color: author.color, content: message, author: author.name }, room);
            setMessage("");
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const UserDetails: FC<any> = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-xl font-bold text-white">How people should call you?</h3>
        <input
          id="username"
          aria-label="username"
          type="text"
          placeholder="Username"
          value={username}
          className="w-full px-3 py-2 rounded-md outline-none"
          onChange={(e) => {
            setUsername(e.target.value);

            if (e.target.value.length == 0) {
              setError("Please enter a username");
              return;
            }

            if (e.target.value.length > 16) {
              setError("Usernames must be 16 characters or less");
              return;
            }

            setError("Enter room");
          }}
        />
      </div>
      <button
        disabled={error === null || username.length == 0}
        className={`bg-white text-md disabled:opacity-10 ${
          error == null ? "disabled:opacity-0" : ""
        } capitalize font-normal rounded-md px-4 py-2 transition-opacity ease-in`}
        onClick={() => {
          if (username.length > 0) {
            setUser((user: User) => ({ ...user, name: username }));
          }
        }}
      >
        {error}
      </button>
    </div>
  );
};

type Message = { content: string; author: string; color: "text-red-600" | "text-sky-600" | "text-teal-600" };
const Messages: FC<{ messages: Message[] }> = ({ messages }) => {
  return (
    <div className="order-1">
      {messages.map((msg, i) => {
        if (msg.author == "Noodle") {
          return (
            <div key={i} className="px-2 py-1 text-sm font-bold break-all border-b border-black text-zinc-900">
              {msg.content}
            </div>
          );
        }

        return (
          <div className="flex items-center px-2 py-1 text-sm break-all border-b border-black" key={i}>
            <div className={msg.color + " font-bold"}>
              <span>{msg.author}:&nbsp;</span>
              <p className="inline font-normal">{msg.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

type User = { name: string | null; color: string };
export default function Room() {
  const [users, setUsers] = useState(0);
  const [user, setUser] = useState<User>({ name: null, color: "text-white" });
  const [messages, setMessages] = useState<Array<Message>>([]);
  const router = useRouter();

  // Send message to all rooms
  const sendMessage = useCallback(
    (message: Message, room: string) => {
      // If author is the server add the client user to message;
      // Ex. User first joins the room.
      message.content = message.author == "Noodle" ? `${user.name} ${message.content}` : message.content;
      // Send message to server to be broadcasted across rooms;
      socket.emit("send-message", message, room);
      // Update client ui with messages and reset current input.
      setMessages((current) => [...current, message]);
    },
    [user.name]
  );

  useEffect(() => {
    // Initialize socket when id is available and a username is chosen.
    const room = (router.query.id as string)?.toLowerCase() as string | undefined;
    if (room && room.length === 8 && user.name) {
      const initSocket = async () => {
        await fetch("/api/socket");
        socket = io();

        socket.emit("join-room", room, () => {
          sendMessage({ author: "Noodle", content: `has joined the room.`, color: "text-sky-600" }, room);
        });

        socket.emit("get-users", room, (total: number) => {
          setUsers(total);
        });

        socket.on("incoming-message", (msg: Message) => {
          setMessages((current) => [...current, msg]);
          if (msg.author == "Noodle") {
            socket.emit("get-users", room, (total: number) => {
              setUsers(total);
            });
          }
        });
      };

      initSocket();

      return () => {
        if (!socket) return;
        socket.disconnect();
      };
    }
  }, [router.query.id, user.name, sendMessage]);

  // Leave room and display a message showing which user left.
  const leaveRoom = async () => {
    router.push("/");
    socket.emit("leave-room", router.query.id, socket.id, user.name, () => {
      sendMessage(
        { author: "Noodle", content: `has left the room.`, color: "text-sky-600" },
        router.query.id as string
      );
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 mx-auto font-mono bg-gradient-to-br from-zinc-500 to-rose-500">
      <main className="flex flex-col items-center justify-center w-full h-full gap-4">
        {!user.name ? (
          <UserDetails setUser={setUser} />
        ) : (
          <>
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-wrap gap-4 px-8 text-xl font-bold text-white">
                <span className="w-max">Room Code: {router.query.id}</span>
                <span
                  onClick={() => {
                    navigator.clipboard.writeText((router.query.id as string) ?? "");
                  }}
                >
                  📋
                </span>
              </div>
              <div>
                <span>
                  {users} {users == 1 ? "user" : "users"}&nbsp;in room.
                </span>
              </div>
            </div>
            <div className="overflow-auto flex bg-transparent border-black/25 border-solid border-2 flex-col-reverse h-[20rem] min-w-full sm:min-w-[300px] max-w-[50%] rounded-md shadow-md">
              <Messages messages={messages} />
              <SendMessage author={user} room={router.query.id as string} sendMessage={sendMessage} />
            </div>
            <button
              className="px-8 py-2 text-white bg-transparent border-2 border-solid rounded border-black/25 drop-shadow-md hover:filter-none focus:filter-none hover:shadow-inner focus:shadow-inner hover:bg-white focus:bg-white hover:text-rose-900 focus:text-rose-900"
              onClick={leaveRoom}
            >
              Leave
            </button>
          </>
        )}
      </main>
    </div>
  );
}
