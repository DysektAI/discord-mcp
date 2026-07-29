import { z } from "zod";

export const SetChannelPrivateSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  channelId: z.string().describe("Channel ID"),
  isPrivate: z
    .boolean()
    .describe(
      "Make channel private (deny @everyone) or public (allow @everyone)",
    ),
  allowedRoles: z
    .array(z.string())
    .optional()
    .describe("Role IDs to grant access to private channel"),
  allowedMembers: z
    .array(z.string())
    .optional()
    .describe("Member IDs to grant access to private channel"),
  syncToCategory: z
    .boolean()
    .optional()
    .describe("Sync permissions with category after change"),
});

export const SetCategoryPrivateSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  categoryId: z.string().describe("Category ID"),
  isPrivate: z
    .boolean()
    .describe(
      "Make category private (deny @everyone) or public (allow @everyone)",
    ),
  allowedRoles: z
    .array(z.string())
    .optional()
    .describe("Role IDs to grant access to private category"),
  allowedMembers: z
    .array(z.string())
    .optional()
    .describe("Member IDs to grant access to private category"),
  applyToChannels: z
    .boolean()
    .optional()
    .describe("Apply privacy settings to all channels in category"),
});

export const BulkSetPrivacySchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  targets: z
    .array(
      z.object({
        id: z.string().describe("Channel or category ID"),
        type: z.enum(["channel", "category"]).describe("Type of target"),
        isPrivate: z.boolean().describe("Make private or public"),
        allowedRoles: z
          .array(z.string())
          .optional()
          .describe("Role IDs to grant access"),
        allowedMembers: z
          .array(z.string())
          .optional()
          .describe("Member IDs to grant access"),
      }),
    )
    .describe("Array of channels/categories to update"),
});

export const ComprehensiveChannelManagementSchema = z.object({
  guildId: z.string().optional().describe("Discord server ID"),
  operations: z
    .array(
      z.object({
        action: z
          .enum([
            "create_text_channel",
            "create_voice_channel",
            "create_forum_channel",
            "create_announcement_channel",
            "create_stage_channel",
            "create_category",
            "edit_channel_advanced",
            "delete_channel",
            "delete_category",
            "set_channel_position",
            "set_category_position",
            "move_channel_to_category",
            "set_channel_private",
            "set_category_private",
          ])
          .describe("Action to perform"),

        // Creation parameters
        name: z
          .string()
          .optional()
          .describe("Name for new channels/categories"),
        categoryId: z
          .string()
          .nullable()
          .optional()
          .describe("Category ID for channel placement"),

        // Target identifiers
        channelId: z
          .string()
          .optional()
          .describe("Target channel ID for operations"),
        targetCategoryId: z
          .string()
          .optional()
          .describe("Target category ID for operations"),

        // Channel settings
        topic: z.string().optional().describe("Channel topic/description"),
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
        defaultReactionEmoji: z
          .string()
          .optional()
          .describe("Default reaction emoji for forum posts"),

        // Positioning
        position: z
          .number()
          .optional()
          .describe("New position for channel/category"),

        // Privacy settings
        isPrivate: z
          .boolean()
          .optional()
          .describe("Make channel/category private"),
        allowedRoles: z
          .array(z.string())
          .optional()
          .describe("Role IDs to grant access"),
        allowedMembers: z
          .array(z.string())
          .optional()
          .describe("Member IDs to grant access"),
        syncToCategory: z
          .boolean()
          .optional()
          .describe("Sync permissions with category"),
        applyToChannels: z
          .boolean()
          .optional()
          .describe("Apply category privacy to all channels"),
      }),
    )
    .describe("Array of operations to perform in sequence"),
});
