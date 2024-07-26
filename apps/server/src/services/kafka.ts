import { Kafka, Producer } from "kafkajs";
import prismaClient from "./prisma";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

const kafka = new Kafka({
  brokers: [process.env.KAFKA_URI ?? " "],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME ?? "",
    password: process.env.KAFKA_PASSWORD ?? "",
    mechanism: "plain",
  },
});

let producer: null | Producer = null;
export async function createProducer() {
  if (producer) return producer;
  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(
  text: string,
  chatRoomName: string,
  chatRoomId: number
) {
  const producer = await createProducer();
  const data = { text, chatRoomName, chatRoomId };
  await producer.send({
    messages: [{ key: `messages-${Date.now()}`, value: JSON.stringify(data) }],
    topic: "MESSAGES",
  });
  return true;
}

export async function startMessageConsumer() {
  console.log("Consumer is running...");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();

  // Fetch all chat rooms from the database
  const chatRooms = await prismaClient.chatRoom.findMany();

  // Subscribe to each chat room's topic
  for (const chatRoom of chatRooms) {
    const topic = "MESSAGES";
    await consumer.subscribe({ topic, fromBeginning: true });
  }

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, topic, pause }) => {
      if (!message.value) return;
      console.log("Kafka message received!");

      // Extract chatRoomName from the topic
      const { text, chatRoom, chatRoomId } = JSON.parse(
        message.value.toString()
      );

      try {
        await prismaClient.message.create({
          data: {
            content: text,
            chatRoomId: chatRoomId,
          },
        });
      } catch (error) {
        console.log("Something went wrong", error);
        pause();
        setTimeout(() => {
          consumer.resume([{ topic }]);
        }, 60 * 1000); // Retry after 60 seconds
      }
    },
  });
}

export default kafka;
