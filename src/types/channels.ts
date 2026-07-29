import { z } from "zod";

export const SetChannelPositionSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  channelId: z.string().describe("Channel ID"),
  position: z.number().describe("New position"),
});

export const SetChannelPositionsSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  channelPositions: z
    .array(
      z.object({
        channelId: z.string().describe("Channel ID"),
        position: z.number().describe("New position"),
      }),
    )
    .describe("Array of channel position updates"),
});

export const MoveChannelToCategorySchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  channelId: z.string().describe("Channel ID"),
  categoryId: z
    .string()
    .nullable()
    .describe("Category ID (null to remove from category)"),
});

export const SetCategoryPositionSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  categoryId: z.string().describe("Category ID"),
  position: z.number().describe("New position"),
});

export const OrganizeChannelsSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  organization: z
    .object({
      categories: z
        .array(
          z.object({
            categoryId: z.string().describe("Category ID"),
            position: z.number().describe("New position"),
          }),
        )
        .optional()
        .describe("Array of category position updates"),
      channels: z
        .array(
          z.object({
            channelId: z.string().describe("Channel ID"),
            position: z.number().optional().describe("New position (optional)"),
            categoryId: z
              .string()
              .nullable()
              .optional()
              .describe("Category ID (null to remove from category, optional)"),
          }),
        )
        .optional()
        .describe("Array of channel updates"),
    })
    .describe("Organization configuration"),
});

export const GetChannelStructureSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
});

export const CreateTextChannelSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  name: z.string().describe("Channel name"),
  categoryId: z.string().optional().describe("Category ID (optional)"),
});

export const CreateVoiceChannelSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  name: z.string().describe("Voice channel name"),
  categoryId: z.string().optional().describe("Category ID (optional)"),
  userLimit: z
    .number()
    .min(0)
    .max(99)
    .optional()
    .describe("User limit (0-99, 0 = unlimited)"),
  bitrate: z
    .number()
    .min(8000)
    .max(384000)
    .optional()
    .describe("Bitrate in bps (8000-384000, depends on server boost level)"),
});

export const CreateForumChannelSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  name: z.string().describe("Forum channel name"),
  categoryId: z.string().optional().describe("Category ID (optional)"),
  topic: z.string().optional().describe("Channel topic/description"),
  slowmode: z
    .number()
    .min(0)
    .max(21600)
    .optional()
    .describe("Slowmode in seconds (0-21600)"),
  defaultReactionEmoji: z
    .string()
    .optional()
    .describe("Default reaction emoji for posts"),
  isPrivate: z
    .boolean()
    .optional()
    .describe("Make channel private (deny @everyone access)"),
  allowedRoles: z
    .array(z.string())
    .optional()
    .describe("Role IDs to grant access to private channel"),
});

export const CreateAnnouncementChannelSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  name: z.string().describe("Announcement channel name"),
  categoryId: z.string().optional().describe("Category ID (optional)"),
  topic: z.string().optional().describe("Channel topic/description"),
  slowmode: z
    .number()
    .min(0)
    .max(21600)
    .optional()
    .describe("Slowmode in seconds (0-21600)"),
  isPrivate: z
    .boolean()
    .optional()
    .describe("Make channel private (deny @everyone access)"),
  allowedRoles: z
    .array(z.string())
    .optional()
    .describe("Role IDs to grant access to private channel"),
});

export const CreateStageChannelSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  name: z.string().describe("Stage channel name"),
  categoryId: z.string().optional().describe("Category ID (optional)"),
  topic: z.string().optional().describe("Channel topic/description"),
  bitrate: z
    .number()
    .min(8000)
    .max(384000)
    .optional()
    .describe("Bitrate in bps (8000-384000, depends on server boost level)"),
  isPrivate: z
    .boolean()
    .optional()
    .describe("Make channel private (deny @everyone access)"),
  allowedRoles: z
    .array(z.string())
    .optional()
    .describe("Role IDs to grant access to private channel"),
});

export const EditChannelAdvancedSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  channelId: z.string().describe("Channel ID to edit"),
  name: z.string().optional().describe("New channel name"),
  topic: z.string().optional().describe("New channel topic/description"),
  slowmode: z
    .number()
    .min(0)
    .max(21600)
    .optional()
    .describe("Slowmode in seconds (0-21600)"),
  userLimit: z
    .number()
    .min(0)
    .max(99)
    .optional()
    .describe("User limit for voice channels (0-99, 0 = unlimited)"),
  bitrate: z
    .number()
    .min(8000)
    .max(384000)
    .optional()
    .describe("Bitrate for voice channels (8000-384000)"),
  isPrivate: z
    .boolean()
    .optional()
    .describe("Make channel private (deny @everyone access)"),
  allowedRoles: z
    .array(z.string())
    .optional()
    .describe("Role IDs to grant access to private channel"),
  categoryId: z
    .string()
    .nullable()
    .optional()
    .describe("Category ID (null to remove from category)"),
});

export const DeleteChannelSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  channelId: z.string().describe("Discord channel ID"),
});

export const FindChannelSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  channelName: z.string().describe("Discord channel name"),
});

export const ListChannelsSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
});

export const CreateCategorySchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  name: z.string().describe("Discord category name"),
});

export const DeleteCategorySchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  categoryId: z.string().describe("Discord category ID"),
});

export const FindCategorySchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  categoryName: z.string().describe("Discord category name"),
});

export const ListChannelsInCategorySchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  categoryId: z.string().describe("Discord category ID"),
});
