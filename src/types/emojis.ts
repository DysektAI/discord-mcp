import { z } from "zod";

export const CreateEmojiSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  name: z.string().describe("Emoji name"),
  imageUrl: z.string().describe("Image URL or base64 data"),
  roles: z
    .array(z.string())
    .optional()
    .describe("Role IDs that can use this emoji"),
});

export const DeleteEmojiSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  emojiId: z.string().describe("Emoji ID"),
});

export const GetEmojisSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
});
