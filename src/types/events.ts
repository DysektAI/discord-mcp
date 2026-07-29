import { z } from "zod";

export const CreateEventSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  name: z.string().describe("Event name"),
  description: z.string().optional().describe("Event description"),
  startTime: z.string().describe("Event start time (ISO 8601)"),
  endTime: z.string().optional().describe("Event end time (ISO 8601)"),
  location: z.string().optional().describe("Event location"),
  channelId: z
    .string()
    .optional()
    .describe("Voice channel ID for voice events"),
});

export const EditEventSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  eventId: z.string().describe("Event ID"),
  name: z.string().optional().describe("New event name"),
  description: z.string().optional().describe("New event description"),
  startTime: z.string().optional().describe("New start time (ISO 8601)"),
  endTime: z.string().optional().describe("New end time (ISO 8601)"),
  location: z.string().optional().describe("New event location"),
});

export const DeleteEventSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  eventId: z.string().describe("Event ID"),
});

export const GetEventsSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
});
