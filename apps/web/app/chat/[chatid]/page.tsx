"use client";
import React, { useEffect, useState } from "react";
import { useSocket } from "../../../context/socket-providers";
import { useParams } from "next/navigation";

const ChatRoom = () => {
  const params = useParams<{ chatid: string }>();
  const chatid = params.chatid;
  const { messages, sendMessage, setChatName } = useSocket();
  const [message, setMessage] = useState("");
  useEffect(() => setChatName(chatid), [chatid, setChatName]);
  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to {chatid}</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border rounded p-2 mb-4 w-64"
        placeholder="Type your message"
      />
      <button
        type="button"
        onClick={() => sendMessage(message)}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Send
      </button>
      <ul className="mt-6 w-64">
        {messages.map((message, idx) => (
          <li
            key={`${idx}${message}`}
            className="bg-white border border-gray-300 rounded p-2 mb-2"
          >
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatRoom;
