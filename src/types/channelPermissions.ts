import { z } from "zod";

export const SetChannelPermissionsSchema = z.object({
  channelId: z.string().describe("Channel ID"),
  targetId: z.string().describe("Role or member ID"),
  targetType: z.enum(["role", "member"]).describe("Target type"),
  allow: z.array(z.string()).optional().describe("Permissions to allow"),
  deny: z.array(z.string()).optional().describe("Permissions to deny"),
});

export const GetChannelPermissionsSchema = z.object({
  channelId: z.string().describe("Channel ID"),
});

export const SyncChannelPermissionsSchema = z.object({
  channelId: z.string().describe("Channel ID"),
});
