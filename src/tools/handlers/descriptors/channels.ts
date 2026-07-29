import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const channelDescriptors: ToolDescriptor[] = [
  {
    name: "create_text_channel",
    schema: schemas.CreateTextChannelSchema,
    keys: ["guildId", "name", "categoryId"],
  },
  {
    name: "create_voice_channel",
    schema: schemas.CreateVoiceChannelSchema,
    keys: ["guildId", "name", "categoryId", "userLimit", "bitrate"],
  },
  {
    name: "create_forum_channel",
    schema: schemas.CreateForumChannelSchema,
    buildArgs: (parsed) => [
      parsed.guildId,
      parsed.name,
      parsed.categoryId,
      {
        topic: parsed.topic,
        slowmode: parsed.slowmode,
        defaultReactionEmoji: parsed.defaultReactionEmoji,
        isPrivate: parsed.isPrivate,
        allowedRoles: parsed.allowedRoles,
      },
    ],
  },
  {
    name: "create_announcement_channel",
    schema: schemas.CreateAnnouncementChannelSchema,
    buildArgs: (parsed) => [
      parsed.guildId,
      parsed.name,
      parsed.categoryId,
      {
        topic: parsed.topic,
        slowmode: parsed.slowmode,
        isPrivate: parsed.isPrivate,
        allowedRoles: parsed.allowedRoles,
      },
    ],
  },
  {
    name: "create_stage_channel",
    schema: schemas.CreateStageChannelSchema,
    buildArgs: (parsed) => [
      parsed.guildId,
      parsed.name,
      parsed.categoryId,
      {
        topic: parsed.topic,
        isPrivate: parsed.isPrivate,
        allowedRoles: parsed.allowedRoles,
      },
    ],
  },
  {
    name: "edit_channel_advanced",
    schema: schemas.EditChannelAdvancedSchema,
    buildArgs: (parsed) => [
      parsed.guildId,
      parsed.channelId,
      {
        name: parsed.name,
        topic: parsed.topic,
        slowmode: parsed.slowmode,
        userLimit: parsed.userLimit,
        bitrate: parsed.bitrate,
        isPrivate: parsed.isPrivate,
        allowedRoles: parsed.allowedRoles,
        categoryId: parsed.categoryId,
      },
    ],
  },
  {
    name: "delete_channel",
    schema: schemas.DeleteChannelSchema,
    keys: ["guildId", "channelId"],
  },
  {
    name: "find_channel",
    schema: schemas.FindChannelSchema,
    keys: ["guildId", "channelName"],
  },
  {
    name: "list_channels",
    schema: schemas.ListChannelsSchema,
    keys: ["guildId"],
  },
  {
    name: "set_channel_position",
    schema: schemas.SetChannelPositionSchema,
    keys: ["channelId", "position"],
  },
  {
    name: "set_channel_positions",
    schema: schemas.SetChannelPositionsSchema,
    keys: ["channelPositions"],
  },
  {
    name: "move_channel_to_category",
    schema: schemas.MoveChannelToCategorySchema,
    keys: ["channelId", "categoryId"],
  },
  {
    name: "organize_channels",
    schema: schemas.OrganizeChannelsSchema,
    keys: ["guildId", "categoryMappings"],
  },
  {
    name: "get_channel_structure",
    schema: schemas.GetChannelStructureSchema,
    keys: ["guildId"],
  },
  {
    name: "create_category",
    schema: schemas.CreateCategorySchema,
    keys: ["guildId", "name"],
  },
  {
    name: "delete_category",
    schema: schemas.DeleteCategorySchema,
    keys: ["guildId", "categoryId"],
  },
  {
    name: "find_category",
    schema: schemas.FindCategorySchema,
    keys: ["guildId", "categoryName"],
  },
  {
    name: "list_channels_in_category",
    schema: schemas.ListChannelsInCategorySchema,
    keys: ["guildId", "categoryId"],
  },
  {
    name: "set_category_position",
    schema: schemas.SetCategoryPositionSchema,
    keys: ["categoryId", "position"],
  },
  {
    name: "set_channel_private",
    schema: schemas.SetChannelPrivateSchema,
    buildArgs: (parsed) => [
      parsed.guildId,
      parsed.channelId,
      {
        isPrivate: parsed.isPrivate,
        allowedRoles: parsed.allowedRoles,
        allowedMembers: parsed.allowedMembers,
        syncToCategory: parsed.syncToCategory,
      },
    ],
  },
  {
    name: "set_category_private",
    schema: schemas.SetCategoryPrivateSchema,
    buildArgs: (parsed) => [
      parsed.guildId,
      parsed.categoryId,
      {
        isPrivate: parsed.isPrivate,
        allowedRoles: parsed.allowedRoles,
        allowedMembers: parsed.allowedMembers,
        applyToChannels: parsed.applyToChannels,
      },
    ],
  },
  {
    name: "bulk_set_privacy",
    schema: schemas.BulkSetPrivacySchema,
    keys: ["guildId", "targets"],
  },
  {
    name: "comprehensive_channel_management",
    schema: schemas.ComprehensiveChannelManagementSchema,
    keys: ["guildId", "operations"],
  },
];
