"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../context/socket-providers";

export default function Page() {
  const [room, setRoom] = useState("");
  const { setChatId } = useSocket();
  const router = useRouter();
  const createRoom = () => {
    if (room.length === 0) return;
    setChatId(room);
    router.replace(`/chat/${room}`);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">
      <div className="bg-white text-gray-900 rounded-lg shadow-lg p-8 flex flex-col items-center space-y-6">
        <h1 className="text-4xl font-extrabold">Anonymous Chat</h1>
        <p className="text-lg">Create a chat room</p>
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="border-2 border-gray-300 rounded-lg p-3 w-64 focus:outline-none focus:border-purple-500"
          placeholder="Enter room name"
        />
        <button
          type="button"
          onClick={createRoom}
          className="bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:bg-purple-600 transition duration-300 ease-in-out"
        >
          Create
        </button>
      </div>
    </div>
  );
}
