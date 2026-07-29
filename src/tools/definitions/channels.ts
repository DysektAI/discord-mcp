export const channelsTools = [
  {
        name: "create_text_channel",
        description: "Create a new text channel",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Channel name",
            },
            categoryId: {
              type: "string",
              description: "Category ID (optional)",
            },
          },
          required: ["name"],
        },
      },
  {
        name: "create_voice_channel",
        description: "Create a new voice channel",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Voice channel name",
            },
            categoryId: {
              type: "string",
              description: "Category ID (optional)",
            },
            userLimit: {
              type: "number",
              description: "User limit (0-99, 0 = unlimited)",
              minimum: 0,
              maximum: 99,
            },
            bitrate: {
              type: "number",
              description:
                "Bitrate in bps (8000-384000, depends on server boost level)",
              minimum: 8000,
              maximum: 384000,
            },
          },
          required: ["name"],
        },
      },
  {
        name: "create_forum_channel",
        description: "Create a forum channel with advanced settings",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Forum channel name",
            },
            categoryId: {
              type: "string",
              description: "Category ID (optional)",
            },
            topic: {
              type: "string",
              description: "Channel topic/description",
            },
            slowmode: {
              type: "number",
              description: "Slowmode in seconds (0-21600)",
              minimum: 0,
              maximum: 21600,
            },
            defaultReactionEmoji: {
              type: "string",
              description: "Default reaction emoji for posts",
            },
            isPrivate: {
              type: "boolean",
              description: "Make channel private (deny @everyone access)",
            },
            allowedRoles: {
              type: "array",
              items: { type: "string" },
              description: "Role IDs to grant access to private channel",
            },
          },
          required: ["name"],
        },
      },
  {
        name: "create_announcement_channel",
        description: "Create an announcement channel with advanced settings",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Announcement channel name",
            },
            categoryId: {
              type: "string",
              description: "Category ID (optional)",
            },
            topic: {
              type: "string",
              description: "Channel topic/description",
            },
            slowmode: {
              type: "number",
              description: "Slowmode in seconds (0-21600)",
              minimum: 0,
              maximum: 21600,
            },
            isPrivate: {
              type: "boolean",
              description: "Make channel private (deny @everyone access)",
            },
            allowedRoles: {
              type: "array",
              items: { type: "string" },
              description: "Role IDs to grant access to private channel",
            },
          },
          required: ["name"],
        },
      },
  {
        name: "create_stage_channel",
        description: "Create a stage voice channel with advanced settings",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Stage channel name",
            },
            categoryId: {
              type: "string",
              description: "Category ID (optional)",
            },
            topic: {
              type: "string",
              description: "Channel topic/description",
            },
            bitrate: {
              type: "number",
              description:
                "Bitrate in bps (8000-384000, depends on server boost level)",
              minimum: 8000,
              maximum: 384000,
            },
            isPrivate: {
              type: "boolean",
              description: "Make channel private (deny @everyone access)",
            },
            allowedRoles: {
              type: "array",
              items: { type: "string" },
              description: "Role IDs to grant access to private channel",
            },
          },
          required: ["name"],
        },
      },
  {
        name: "edit_channel_advanced",
        description:
          "Edit any channel with advanced settings including privacy and permissions",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            channelId: {
              type: "string",
              description: "Channel ID to edit",
            },
            name: {
              type: "string",
              description: "New channel name",
            },
            topic: {
              type: "string",
              description: "New channel topic/description",
            },
            slowmode: {
              type: "number",
              description: "Slowmode in seconds (0-21600)",
              minimum: 0,
              maximum: 21600,
            },
            userLimit: {
              type: "number",
              description: "User limit for voice channels (0-99, 0 = unlimited)",
              minimum: 0,
              maximum: 99,
            },
            bitrate: {
              type: "number",
              description: "Bitrate for voice channels (8000-384000)",
              minimum: 8000,
              maximum: 384000,
            },
            isPrivate: {
              type: "boolean",
              description: "Make channel private (deny @everyone access)",
            },
            allowedRoles: {
              type: "array",
              items: { type: "string" },
              description: "Role IDs to grant access to private channel",
            },
            categoryId: {
              type: ["string", "null"],
              description: "Category ID (null to remove from category)",
            },
          },
          required: ["channelId"],
        },
      },
  {
        name: "delete_channel",
        description: "Delete a channel",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
          },
          required: ["channelId"],
        },
      },
  {
        name: "find_channel",
        description: "Find a channel type and ID using name and server ID",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            channelName: {
              type: "string",
              description: "Discord channel name",
            },
          },
          required: ["channelName"],
        },
      },
  {
        name: "list_channels",
        description: "List of all channels",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
          },
          required: [],
        },
      },
  {
        name: "create_category",
        description: "Create a new category for channels",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Discord category name",
            },
          },
          required: ["name"],
        },
      },
  {
        name: "delete_category",
        description: "Delete a category",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            categoryId: {
              type: "string",
              description: "Discord category ID",
            },
          },
          required: ["categoryId"],
        },
      },
  {
        name: "find_category",
        description: "Find a category ID using name and server ID",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            categoryName: {
              type: "string",
              description: "Discord category name",
            },
          },
          required: ["categoryName"],
        },
      },
  {
        name: "list_channels_in_category",
        description: "List of channels in a specific category",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            categoryId: {
              type: "string",
              description: "Discord category ID",
            },
          },
          required: ["categoryId"],
        },
      },
  {
        name: "set_channel_position",
        description: "Move a channel to a specific position",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            position: {
              type: "number",
              description: "New position (0-based)",
            },
          },
          required: ["channelId", "position"],
        },
      },
  {
        name: "set_channel_positions",
        description: "Move multiple channels to specific positions",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            channelPositions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  channelId: {
                    type: "string",
                    description: "Channel ID",
                  },
                  position: {
                    type: "number",
                    description: "New position (0-based)",
                  },
                },
                required: ["channelId", "position"],
              },
              description: "Array of channel position updates",
            },
          },
          required: ["channelPositions"],
        },
      },
  {
        name: "move_channel_to_category",
        description: "Move a channel to a category or remove it from a category",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            categoryId: {
              type: ["string", "null"],
              description: "Category ID (null to remove from category)",
            },
          },
          required: ["channelId", "categoryId"],
        },
      },
  {
        name: "set_category_position",
        description: "Move a category to a specific position",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            categoryId: {
              type: "string",
              description: "Category ID",
            },
            position: {
              type: "number",
              description: "New position (0-based)",
            },
          },
          required: ["categoryId", "position"],
        },
      },
  {
        name: "organize_channels",
        description: "Comprehensive channel and category organization tool",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            organization: {
              type: "object",
              properties: {
                categories: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      categoryId: {
                        type: "string",
                        description: "Category ID",
                      },
                      position: {
                        type: "number",
                        description: "New position",
                      },
                    },
                    required: ["categoryId", "position"],
                  },
                  description: "Array of category position updates",
                },
                channels: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      channelId: {
                        type: "string",
                        description: "Channel ID",
                      },
                      position: {
                        type: "number",
                        description: "New position (optional)",
                      },
                      categoryId: {
                        type: ["string", "null"],
                        description:
                          "Category ID (null to remove from category, optional)",
                      },
                    },
                    required: ["channelId"],
                  },
                  description: "Array of channel updates",
                },
              },
              description: "Organization configuration",
            },
          },
          required: ["organization"],
        },
      },
  {
        name: "get_channel_structure",
        description:
          "Get the current channel and category structure of the server",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
          },
          required: [],
        },
      },
  {
        name: "set_channel_private",
        description:
          "Make a channel private or public with role/member access control",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            isPrivate: {
              type: "boolean",
              description:
                "Make channel private (deny @everyone) or public (allow @everyone)",
            },
            allowedRoles: {
              type: "array",
              items: { type: "string" },
              description: "Role IDs to grant access to private channel",
            },
            allowedMembers: {
              type: "array",
              items: { type: "string" },
              description: "Member IDs to grant access to private channel",
            },
            syncToCategory: {
              type: "boolean",
              description: "Sync permissions with category after change",
            },
          },
          required: ["channelId", "isPrivate"],
        },
      },
  {
        name: "set_category_private",
        description:
          "Make a category private or public with role/member access control",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            categoryId: {
              type: "string",
              description: "Category ID",
            },
            isPrivate: {
              type: "boolean",
              description:
                "Make category private (deny @everyone) or public (allow @everyone)",
            },
            allowedRoles: {
              type: "array",
              items: { type: "string" },
              description: "Role IDs to grant access to private category",
            },
            allowedMembers: {
              type: "array",
              items: { type: "string" },
              description: "Member IDs to grant access to private category",
            },
            applyToChannels: {
              type: "boolean",
              description: "Apply privacy settings to all channels in category",
            },
          },
          required: ["categoryId", "isPrivate"],
        },
      },
  {
        name: "bulk_set_privacy",
        description:
          "Set privacy for multiple channels and categories in one operation",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            targets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "Channel or category ID",
                  },
                  type: {
                    type: "string",
                    enum: ["channel", "category"],
                    description: "Type of target",
                  },
                  isPrivate: {
                    type: "boolean",
                    description: "Make private or public",
                  },
                  allowedRoles: {
                    type: "array",
                    items: { type: "string" },
                    description: "Role IDs to grant access",
                  },
                  allowedMembers: {
                    type: "array",
                    items: { type: "string" },
                    description: "Member IDs to grant access",
                  },
                },
                required: ["id", "type", "isPrivate"],
              },
              description: "Array of channels/categories to update",
            },
          },
          required: ["targets"],
        },
      },
  {
        name: "comprehensive_channel_management",
        description:
          "All-in-one channel management tool that performs multiple channel operations in sequence",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            operations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: {
                    type: "string",
                    enum: [
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
                    ],
                    description: "Action to perform",
                  },
                  name: {
                    type: "string",
                    description: "Name for new channels/categories",
                  },
                  categoryId: {
                    type: ["string", "null"],
                    description: "Category ID for channel placement",
                  },
                  channelId: {
                    type: "string",
                    description: "Target channel ID for operations",
                  },
                  targetCategoryId: {
                    type: "string",
                    description: "Target category ID for operations",
                  },
                  topic: {
                    type: "string",
                    description: "Channel topic/description",
                  },
                  slowmode: {
                    type: "number",
                    minimum: 0,
                    maximum: 21600,
                    description: "Slowmode in seconds (0-21600)",
                  },
                  userLimit: {
                    type: "number",
                    minimum: 0,
                    maximum: 99,
                    description:
                      "User limit for voice channels (0-99, 0 = unlimited)",
                  },
                  bitrate: {
                    type: "number",
                    minimum: 8000,
                    maximum: 384000,
                    description: "Bitrate for voice channels (8000-384000)",
                  },
                  defaultReactionEmoji: {
                    type: "string",
                    description: "Default reaction emoji for forum posts",
                  },
                  position: {
                    type: "number",
                    description: "New position for channel/category",
                  },
                  isPrivate: {
                    type: "boolean",
                    description: "Make channel/category private",
                  },
                  allowedRoles: {
                    type: "array",
                    items: { type: "string" },
                    description: "Role IDs to grant access",
                  },
                  allowedMembers: {
                    type: "array",
                    items: { type: "string" },
                    description: "Member IDs to grant access",
                  },
                  syncToCategory: {
                    type: "boolean",
                    description: "Sync permissions with category",
                  },
                  applyToChannels: {
                    type: "boolean",
                    description: "Apply category privacy to all channels",
                  },
                },
                required: ["action"],
              },
              description: "Array of operations to perform in sequence",
            },
          },
          required: ["operations"],
        },
      }
];
