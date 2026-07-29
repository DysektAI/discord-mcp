import { z } from "zod";

export const CreateWebhookSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  name: z.string().describe("Webhook name"),
});

export const DeleteWebhookSchema = z.object({
  webhookId: z.string().describe("Discord webhook ID"),
});

export const ListWebhooksSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
});

export const SendWebhookMessageSchema = z.object({
  webhookUrl: z.string().describe("Discord webhook link"),
  message: z.string().describe("Message content"),
});
