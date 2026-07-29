import { z } from "zod";

export const BanMemberSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  userId: z.string().describe("Discord user ID"),
  reason: z.string().optional().describe("Reason for ban"),
  deleteMessageDays: z
    .number()
    .optional()
    .describe("Days of messages to delete (0-7)"),
});

export const UnbanMemberSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  userId: z.string().describe("Discord user ID"),
  reason: z.string().optional().describe("Reason for unban"),
});

export const KickMemberSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  userId: z.string().describe("Discord user ID"),
  reason: z.string().optional().describe("Reason for kick"),
});

export const TimeoutMemberSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  userId: z.string().describe("Discord user ID"),
  duration: z.number().describe("Timeout duration in minutes"),
  reason: z.string().optional().describe("Reason for timeout"),
});

export const RemoveTimeoutSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  userId: z.string().describe("Discord user ID"),
  reason: z.string().optional().describe("Reason for removing timeout"),
});

export const GetAuditLogsSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  limit: z.number().optional().describe("Number of audit log entries to fetch"),
  actionType: z.string().optional().describe("Filter by action type"),
});

export const GetBansSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
});
