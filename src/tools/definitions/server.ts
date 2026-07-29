export const serverTools = [
  {
        name: "get_server_info",
        description: "Get detailed discord server information",
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
        name: "edit_server",
        description:
          "Edit server settings like name, description, and verification level",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "New server name",
            },
            description: {
              type: "string",
              description: "New server description",
            },
            icon: {
              type: "string",
              description: "New server icon URL",
            },
            banner: {
              type: "string",
              description: "New server banner URL",
            },
            verificationLevel: {
              type: "string",
              enum: ["NONE", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"],
              description: "Verification level",
            },
          },
          required: [],
        },
      },
  {
        name: "get_server_widget",
        description: "Get server widget information",
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
        name: "get_welcome_screen",
        description: "Get server welcome screen information",
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
        name: "edit_welcome_screen",
        description: "Edit server welcome screen settings",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            enabled: {
              type: "boolean",
              description: "Whether welcome screen is enabled",
            },
            description: {
              type: "string",
              description: "Welcome screen description",
            },
            welcomeChannels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  channelId: { type: "string", description: "Channel ID" },
                  description: {
                    type: "string",
                    description: "Channel description",
                  },
                  emoji: { type: "string", description: "Channel emoji" },
                },
              },
              description: "Welcome screen channels",
            },
          },
          required: [],
        },
      },
  {
        name: "get_server_stats",
        description: "Get comprehensive server statistics",
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
      }
];
