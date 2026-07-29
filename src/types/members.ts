import { z } from "zod";

export const GetMembersSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  limit: z
    .number()
    .optional()
    .describe("Number of members to fetch (default 100)"),
  after: z.string().optional().describe("User ID to fetch members after"),
});

export const SearchMembersSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  query: z.string().describe("Search query (username or nickname)"),
  limit: z.number().optional().describe("Max results to return"),
});

export const EditMemberSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  userId: z.string().describe("Discord user ID"),
  nickname: z.string().optional().describe("New nickname"),
  roles: z.array(z.string()).optional().describe("Array of role IDs to set"),
});

export const GetMemberInfoSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  userId: z.string().describe("Discord user ID"),
});
