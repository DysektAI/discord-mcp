export const privateMessagesTools = [
  {
        name: "get_user_id_by_name",
        description:
          "Get a Discord user's ID by username in a guild for ping usage <@id>.",
        inputSchema: {
          type: "object",
          properties: {
            username: {
              type: "string",
              description: "Discord username (optionally username#discriminator)",
            },
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
          },
          required: ["username"],
        },
      },
  {
        name: "send_private_message",
        description: "Send a private message to a specific user",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "Discord user ID",
            },
            message: {
              type: "string",
              description: "Message content",
            },
          },
          required: ["userId", "message"],
        },
      },
  {
        name: "edit_private_message",
        description: "Edit a private message from a specific user",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "Discord user ID",
            },
            messageId: {
              type: "string",
              description: "Specific message ID",
            },
            newMessage: {
              type: "string",
              description: "New message content",
            },
          },
          required: ["userId", "messageId", "newMessage"],
        },
      },
  {
        name: "delete_private_message",
        description: "Delete a private message from a specific user",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "Discord user ID",
            },
            messageId: {
              type: "string",
              description: "Specific message ID",
            },
          },
          required: ["userId", "messageId"],
        },
      },
  {
        name: "read_private_messages",
        description: "Read recent message history from a specific user",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "Discord user ID",
            },
            count: {
              type: "string",
              description: "Number of messages to retrieve",
            },
          },
          required: ["userId"],
        },
      }
];
