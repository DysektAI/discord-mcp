export const emojisTools = [
  {
        name: "create_emoji",
        description: "Create a custom emoji in the server",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Emoji name",
            },
            imageUrl: {
              type: "string",
              description: "Image URL or base64 data",
            },
            roles: {
              type: "array",
              items: { type: "string" },
              description: "Role IDs that can use this emoji",
            },
          },
          required: ["name", "imageUrl"],
        },
      },
  {
        name: "delete_emoji",
        description: "Delete a custom emoji from the server",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            emojiId: {
              type: "string",
              description: "Emoji ID",
            },
          },
          required: ["emojiId"],
        },
      },
  {
        name: "get_emojis",
        description: "List all custom emojis in the server",
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
