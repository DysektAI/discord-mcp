import { z } from "zod";

export const ServerInfoSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
});

export const GetServerStatsSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
});

export const GetServerWidgetSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
});

export const EditServerSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  name: z.string().optional().describe("New server name"),
  description: z.string().optional().describe("New server description"),
  icon: z.string().optional().describe("New server icon URL"),
  banner: z.string().optional().describe("New server banner URL"),
  verificationLevel: z
    .enum(["NONE", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"])
    .optional()
    .describe("Verification level"),
});

export const GetWelcomeScreenSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
});

export const EditWelcomeScreenSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  enabled: z.boolean().optional().describe("Whether welcome screen is enabled"),
  description: z.string().optional().describe("Welcome screen description"),
  welcomeChannels: z
    .array(
      z.object({
        channelId: z.string().describe("Channel ID"),
        description: z.string().describe("Channel description"),
        emoji: z.string().optional().describe("Channel emoji"),
      }),
    )
    .optional()
    .describe("Welcome screen channels"),
});
