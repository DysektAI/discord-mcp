import { z } from "zod";

export const GetUserIdByNameSchema = z.object({
  username: z
    .string()
    .describe("Discord username (optionally username#discriminator)"),
  guildId: z.string().optional().describe("Discord server ID"),
});

export const SendPrivateMessageSchema = z.object({
  userId: z.string().describe("Discord user ID"),
  message: z.string().describe("Message content"),
});

export const EditPrivateMessageSchema = z.object({
  userId: z.string().describe("Discord user ID"),
  messageId: z.string().describe("Specific message ID"),
  newMessage: z.string().describe("New message content"),
});

export const DeletePrivateMessageSchema = z.object({
  userId: z.string().describe("Discord user ID"),
  messageId: z.string().describe("Specific message ID"),
});

export const ReadPrivateMessagesSchema = z.object({
  userId: z.string().describe("Discord user ID"),
  count: z.string().optional().describe("Number of messages to retrieve"),
});
