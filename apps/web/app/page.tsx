"use client";
import { useState } from "react";

import classes from "./page.module.css";
import { useSocket } from "../context/socket-providers";

export default function Page() {
  const { sendMessage,  } = useSocket();
  const [message, setMessage] = useState("");

  return (
    <div>
      <div>
        <input
          onChange={(e) => setMessage(e.target.value)}
          className={classes["chat-input"]}
          placeholder="Message..."
        />
        <button
          onClick={() => sendMessage(message)}
          className={classes["button"]}
        >
          Send
        </button>
      </div>
      {/* <div>
        {messages.map((e) => (
          <li>{e}</li>
        ))}
      </div>*/}
    </div> 
  );
}