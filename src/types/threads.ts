import { z } from "zod";

export const CreateThreadSchema = z.object({
  channelId: z.string().describe("Channel ID"),
  name: z.string().describe("Thread name"),
  autoArchiveDuration: z
    .number()
    .optional()
    .describe("Auto archive duration in minutes"),
  messageId: z.string().optional().describe("Message ID to create thread from"),
});

export const ArchiveThreadSchema = z.object({
  threadId: z.string().describe("Thread ID"),
  reason: z.string().optional().describe("Reason for archiving"),
});

export const UnarchiveThreadSchema = z.object({
  threadId: z.string().describe("Thread ID"),
  reason: z.string().optional().describe("Reason for unarchiving"),
});

export const LockThreadSchema = z.object({
  threadId: z.string().describe("Thread ID"),
  reason: z.string().optional().describe("Reason for locking"),
});

export const UnlockThreadSchema = z.object({
  threadId: z.string().describe("Thread ID"),
  reason: z.string().optional().describe("Reason for unlocking"),
});

export const JoinThreadSchema = z.object({
  threadId: z.string().describe("Thread ID"),
});

export const LeaveThreadSchema = z.object({
  threadId: z.string().describe("Thread ID"),
});

export const GetActiveThreadsSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
});
