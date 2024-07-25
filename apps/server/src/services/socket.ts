import { Server } from "socket.io";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

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

const prisma = new PrismaClient();
console.log("this is dburl :", process.env.DATABASE_URL);

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
    sub.on("message", (channel, message) => {
      console.log(`Received message on channel ${channel}`);
      console.log(`this is channel :, message-${channel.split("-")[1]}`);
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
        async ({
          message,
          chatName,
        }: {
          message: string;
          chatName: string;
        }) => {
          console.log("New Message received:", message);
          console.log("chatName:", chatName);
          try {
            // Check if the chat room exists
            let chatRoom = await prisma.chatRoom.findUnique({
              where: { name: chatName },
            });

            // If the chat room doesn't exist, create it
            if (!chatRoom) {
              chatRoom = await prisma.chatRoom.create({
                data: { name: chatName },
              });
              console.log(`Created new chat room with name: ${chatRoom.name}`);
            }

            // Save the message in the database
            const savedMessage = await prisma.message.create({
              data: {
                content: message,
                chatRoomId: chatRoom.id,
              },
            });

            const channel = `MESSAGES-${chatRoom.name}`;
            console.log("channel :", channel);
            await pub.publish(channel, JSON.stringify(savedMessage));

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
          } catch (error) {
            console.error("Error saving message:", error);
          }
        }
      );
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;

// import { Server } from "socket.io";
// import Redis from "ioredis";
// import { PrismaClient } from "@prisma/client";

// const pub = new Redis({
//   host: "redis-14080.c250.eu-central-1-1.ec2.redns.redis-cloud.com",
//   port: 14080,
//   username: "default",
//   password: "KTBa2pY4VZsQPa2cFOHmzaBS52sbTT9E",
// });
// const sub = new Redis({
//   host: "redis-14080.c250.eu-central-1-1.ec2.redns.redis-cloud.com",
//   port: 14080,
//   username: "default",
//   password: "KTBa2pY4VZsQPa2cFOHmzaBS52sbTT9E",
// });

// const prisma = new PrismaClient();

// class SocketService {
//   private _io: Server;

//   constructor() {
//     console.log("Init Socket Server...");
//     this._io = new Server({
//       cors: {
//         allowedHeaders: ["*"],
//         origin: "*",
//       },
//     });

//     // Log successful connection to Redis
//     sub.on("connect", () => {
//       console.log("Connected to Redis");
//     });

//     sub.on("error", (err) => {
//       console.error("Redis error:", err);
//     });

//     // Message event handler
//     sub.on("message", async (channel, message) => {
//       console.log(`Received message on channel ${channel}`);
//       this._io.emit(`message-${channel.split("-")[1]}`, message);
//     });
//   }

//   public initListeners() {
//     const io = this.io;
//     console.log("Init socket listeners");

//     io.on("connect", (socket) => {
//       console.log(`New socket connected ${socket.id}`);
//       socket.on(
//         "event:message",
//         async ({ message, chatName }: { message: string; chatName: string }) => {
//           console.log("New Message received:", message);
//           console.log("chatName:", chatName);

//           // Save the message to the database
//           try {
//             const savedMessage = await prisma.message.create({
//               data: {
//                 content: message,
//                 chatRoom: { connect: { id: chatName } },
//                 // Assuming userId is available and sent with the message
//                 user: { connect: { id: socket.userId || 1 } }, // Replace with actual user identification logic
//               },
//             });

//             const channel = `MESSAGES-${chatName}`;
//             await pub.publish(channel, JSON.stringify(savedMessage));

//             // Subscribe to the specific dynamic channel
//             sub.subscribe(channel, (err, count) => {
//               if (err) {
//                 console.error(`Failed to subscribe to ${channel}:`, err);
//               } else {
//                 console.log(
//                   `Subscribed to ${channel}, ${count} total subscriptions`
//                 );
//               }
//             });
//           } catch (error) {
//             console.error("Error saving message:", error);
//           }
//         }
//       );
//     });
//   }

//   get io() {
//     return this._io;
//   }
// }

// export default SocketService;
