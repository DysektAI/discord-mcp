import { z } from "zod";

export const CreateStickerSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  name: z.string().describe("Sticker name"),
  description: z.string().describe("Sticker description"),
  tags: z.string().describe("Sticker tags"),
  imageUrl: z.string().describe("Image URL or file path"),
});

export const DeleteStickerSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  stickerId: z.string().describe("Sticker ID"),
});

export const GetStickersSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
});
