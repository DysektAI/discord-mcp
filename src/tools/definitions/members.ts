export const membersTools = [
  {
        name: "get_members",
        description: "Get server members with pagination",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            limit: {
              type: "number",
              description: "Number of members to fetch (default 100)",
            },
            after: {
              type: "string",
              description: "User ID to fetch members after",
            },
          },
          required: [],
        },
      },
  {
        name: "search_members",
        description: "Search members by username or nickname",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            query: {
              type: "string",
              description: "Search query (username or nickname)",
            },
            limit: {
              type: "number",
              description: "Max results to return",
            },
          },
          required: ["query"],
        },
      },
  {
        name: "edit_member",
        description: "Edit member properties like nickname and roles",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            userId: {
              type: "string",
              description: "Discord user ID",
            },
            nickname: {
              type: "string",
              description: "New nickname",
            },
            roles: {
              type: "array",
              items: { type: "string" },
              description: "Array of role IDs to set",
            },
          },
          required: ["userId"],
        },
      },
  {
        name: "get_member_info",
        description: "Get detailed information about a member",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            userId: {
              type: "string",
              description: "Discord user ID",
            },
          },
          required: ["userId"],
        },
      }
];
