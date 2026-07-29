import { z } from "zod";

export const CreateRoleSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  name: z.string().describe("Name of the role"),
  color: z.string().optional().describe("Role color (hex format)"),
  permissions: z
    .array(z.string())
    .optional()
    .describe("Array of permission names"),
});

export const DeleteRoleSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  roleId: z.string().describe("Role ID"),
});

export const EditRoleSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  roleId: z.string().describe("Role ID"),
  name: z.string().optional().describe("New name for the role"),
  color: z.string().optional().describe("New color (hex format)"),
  permissions: z.array(z.string()).optional().describe("New permissions array"),
});

export const AddRoleToMemberSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  userId: z.string().describe("Discord user ID"),
  roleId: z.string().describe("Role ID"),
});

export const RemoveRoleFromMemberSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  userId: z.string().describe("Discord user ID"),
  roleId: z.string().describe("Role ID"),
});

export const GetRolesSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
});

export const SetRolePositionsSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  rolePositions: z
    .array(
      z.object({
        roleId: z.string().describe("Role ID"),
        position: z.number().describe("New position"),
      }),
    )
    .describe("Array of role position updates"),
});
