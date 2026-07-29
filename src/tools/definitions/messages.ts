export const messagesTools = [
  {
        name: "send_message",
        description: "Send a message to a specific channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
            message: {
              type: "string",
              description: "Message content",
            },
          },
          required: ["channelId", "message"],
        },
      },
  {
        name: "reply_message",
        description: "Reply to a specific message in a channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
            messageId: {
              type: "string",
              description: "Message ID to reply to",
            },
            message: {
              type: "string",
              description: "Reply message content",
            },
          },
          required: ["channelId", "messageId", "message"],
        },
      },
  {
        name: "edit_message",
        description: "Edit a message from a specific channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
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
          required: ["channelId", "messageId", "newMessage"],
        },
      },
  {
        name: "delete_message",
        description: "Delete a message from a specific channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
            messageId: {
              type: "string",
              description: "Specific message ID",
            },
          },
          required: ["channelId", "messageId"],
        },
      },
  {
        name: "read_messages",
        description: "Read recent message history from a specific channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
            count: {
              type: "string",
              description: "Number of messages to retrieve",
            },
          },
          required: ["channelId"],
        },
      },
  {
        name: "add_reaction",
        description: "Add a reaction (emoji) to a specific message",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
            messageId: {
              type: "string",
              description: "Discord message ID",
            },
            emoji: {
              type: "string",
              description: "Emoji (Unicode or string)",
            },
          },
          required: ["channelId", "messageId", "emoji"],
        },
      },
  {
        name: "remove_reaction",
        description: "Remove a specified reaction (emoji) from a message",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
            messageId: {
              type: "string",
              description: "Discord message ID",
            },
            emoji: {
              type: "string",
              description: "Emoji (Unicode or string)",
            },
          },
          required: ["channelId", "messageId", "emoji"],
        },
      },
  {
        name: "pin_message",
        description: "Pin a message in a channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
            messageId: {
              type: "string",
              description: "Message ID to pin",
            },
          },
          required: ["channelId", "messageId"],
        },
      },
  {
        name: "unpin_message",
        description: "Unpin a message in a channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
            messageId: {
              type: "string",
              description: "Message ID to unpin",
            },
          },
          required: ["channelId", "messageId"],
        },
      },
  {
        name: "get_pinned_messages",
        description: "Get all pinned messages in a channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
          },
          required: ["channelId"],
        },
      },
  {
        name: "bulk_delete_messages",
        description:
          "Delete specific messages by ID (requires confirm to execute)",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
            messageIds: {
              type: "array",
              items: { type: "string" },
              description:
                "Array of message IDs to delete (required; provide explicit IDs)",
            },
            filterOld: {
              type: "boolean",
              description: "Filter out messages older than 14 days",
            },
            deleteOldIndividually: {
              type: "boolean",
              description:
                "Delete messages older than 14 days one by one (avoids bulk delete limit)",
            },
            confirm: {
              type: "boolean",
              description:
                "Set true to execute deletion (otherwise returns a preview only)",
            },
          },
          required: ["channelId", "messageIds"],
        },
      },
  {
        name: "crosspost_message",
        description: "Crosspost an announcement message",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Announcement channel ID",
            },
            messageId: {
              type: "string",
              description: "Message ID to crosspost",
            },
          },
          required: ["channelId", "messageId"],
        },
      },
  {
        name: "get_message_attachments",
        description: "Get attachments from a specific message",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            messageId: {
              type: "string",
              description: "Message ID",
            },
          },
          required: ["channelId", "messageId"],
        },
      },
  {
        name: "read_images",
        description:
          "Read and analyze images from Discord messages with optional metadata and content analysis",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Channel ID to read images from",
            },
            messageId: {
              type: "string",
              description:
                "Specific message ID (optional - if not provided, searches recent messages)",
            },
            limit: {
              type: "number",
              description:
                "Number of recent messages to search for images (1-10)",
              minimum: 1,
              maximum: 10,
            },
            includeMetadata: {
              type: "boolean",
              description: "Include image metadata (dimensions, file size, etc.)",
            },
            downloadImages: {
              type: "boolean",
              description:
                "Download and analyze image content (slower but more detailed)",
            },
          },
          required: ["channelId"],
        },
      },
  {
        name: "get_message_history",
        description: "Get message history from a channel with pagination",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            limit: {
              type: "number",
              description: "Number of messages to retrieve (max 100)",
            },
            before: {
              type: "string",
              description: "Message ID to fetch before",
            },
            after: {
              type: "string",
              description: "Message ID to fetch after",
            },
          },
          required: ["channelId"],
        },
      },
  {
        name: "export_chat_log",
        description: "Export chat messages in various formats",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            format: {
              type: "string",
              enum: ["JSON", "CSV", "TXT"],
              description: "Export format",
            },
            limit: {
              type: "number",
              description:
                "Number of messages to export (supports >100 via pagination)",
            },
            dateRange: {
              type: "object",
              properties: {
                start: { type: "string", description: "Start date (ISO 8601)" },
                end: { type: "string", description: "End date (ISO 8601)" },
              },
              description: "Date range filter",
            },
          },
          required: ["channelId", "format"],
        },
      }
];
