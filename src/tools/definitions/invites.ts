export const invitesTools = [
  {
        name: "create_invite",
        description: "Create an invite link with custom settings",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            maxAge: {
              type: "number",
              description: "Invite expiration in seconds (0 = never)",
            },
            maxUses: {
              type: "number",
              description: "Maximum uses (0 = unlimited)",
            },
            temporary: {
              type: "boolean",
              description: "Grant temporary membership",
            },
          },
          required: ["channelId"],
        },
      },
  {
        name: "delete_invite",
        description: "Delete/revoke an invite",
        inputSchema: {
          type: "object",
          properties: {
            inviteCode: {
              type: "string",
              description: "Invite code to delete",
            },
          },
          required: ["inviteCode"],
        },
      },
  {
        name: "get_invites",
        description: "List all server invites",
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
