import { z } from "zod";

export const CreateInviteSchema = z.object({
  channelId: z.string().describe("Channel ID"),
  maxAge: z
    .number()
    .optional()
    .describe("Invite expiration in seconds (0 = never)"),
  maxUses: z.number().optional().describe("Maximum uses (0 = unlimited)"),
  temporary: z.boolean().optional().describe("Grant temporary membership"),
});

export const DeleteInviteSchema = z.object({
  inviteCode: z.string().describe("Invite code"),
});

export const GetInvitesSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
});
