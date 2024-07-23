import { Server } from "socket.io";
import Redis from "ioredis";

const pub = new Redis({
  host: "redis-14080.c250.eu-central-1-1.ec2.redns.redis-cloud.com",
  port: 14080,
  username: "default",
  password: "KTBa2pY4VZsQPa2cFOHmzaBS52sbTT9E",
});
const sub = new Redis({
  host: "redis-14080.c250.eu-central-1-1.ec2.redns.redis-cloud.com",
  port: 14080,
  username: "default",
  password: "KTBa2pY4VZsQPa2cFOHmzaBS52sbTT9E",
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init Socket Server...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    // Log successful connection to Redis
    sub.on("connect", () => {
      console.log("Connected to Redis");
    });

    sub.on("error", (err) => {
      console.error("Redis error:", err);
    });

    // Message event handler
    sub.on("message", async (channel, message) => {
      console.log(`Received message on channel ${channel}`);
      this._io.emit(`message-${channel.split("-")[1]}`, message);
    });
  }

  public initListeners() {
    const io = this.io;
    console.log("Init socket listeners");

    io.on("connect", (socket) => {
      console.log(`New socket connected ${socket.id}`);
      socket.on(
        "event:message",
        async ({ message, chatId }: { message: string; chatId: string }) => {
          console.log("New Message received:", message);
          console.log("chatId:", chatId);

          const channel = `MESSAGES-${chatId}`;
          await pub.publish(channel, JSON.stringify({ message }));

          // Subscribe to the specific dynamic channel
          sub.subscribe(channel, (err, count) => {
            if (err) {
              console.error(`Failed to subscribe to ${channel}:`, err);
            } else {
              console.log(
                `Subscribed to ${channel}, ${count} total subscriptions`
              );
            }
          });
        }
      );
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
