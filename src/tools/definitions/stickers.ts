export const stickersTools = [
  {
        name: "create_sticker",
        description: "Create a custom sticker in the server",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Sticker name",
            },
            description: {
              type: "string",
              description: "Sticker description",
            },
            tags: {
              type: "string",
              description: "Sticker tags",
            },
            imageUrl: {
              type: "string",
              description: "Image URL or file path",
            },
          },
          required: ["name", "description", "tags", "imageUrl"],
        },
      },
  {
        name: "delete_sticker",
        description: "Delete a custom sticker from the server",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            stickerId: {
              type: "string",
              description: "Sticker ID",
            },
          },
          required: ["stickerId"],
        },
      },
  {
        name: "get_stickers",
        description: "List all custom stickers in the server",
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
