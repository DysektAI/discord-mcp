import { z } from "zod";

export const CreateAutomodRuleSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  name: z.string().describe("Rule name"),
  eventType: z.enum(["MESSAGE_SEND"]).describe("Event type to trigger on"),
  triggerType: z
    .enum(["KEYWORD", "SPAM", "KEYWORD_PRESET", "MENTION_SPAM"])
    .describe("Trigger type"),
  keywordFilter: z.array(z.string()).optional().describe("Keywords to filter"),
  presets: z.array(z.string()).optional().describe("Preset keyword lists"),
  allowList: z.array(z.string()).optional().describe("Allowed words"),
  mentionLimit: z.number().optional().describe("Max mentions allowed"),
  enabled: z.boolean().optional().describe("Whether rule is enabled"),
});

export const EditAutomodRuleSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  ruleId: z.string().describe("Automod rule ID"),
  name: z.string().optional().describe("New rule name"),
  enabled: z.boolean().optional().describe("Whether rule is enabled"),
  keywordFilter: z.array(z.string()).optional().describe("Keywords to filter"),
  allowList: z.array(z.string()).optional().describe("Allowed words"),
  mentionLimit: z.number().optional().describe("Max mentions allowed"),
});

export const DeleteAutomodRuleSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  ruleId: z.string().describe("Automod rule ID"),
});

export const GetAutomodRulesSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
});
