export const webhooksTools = [
  {
        name: "create_webhook",
        description: "Create a new webhook on a specific channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Discord channel ID",
            },
            name: {
              type: "string",
              description: "Webhook name",
            },
          },
          required: ["channelId", "name"],
        },
      },
  {
        name: "delete_webhook",
        description: "Delete a webhook",
        inputSchema: {
          type: "object",
          properties: {
            webhookId: {
              type: "string",
              description: "Discord webhook ID",
            },
          },
          required: ["webhookId"],
        },
      },
  {
        name: "list_webhooks",
        description: "List of webhooks on a specific channel",
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
        name: "send_webhook_message",
        description: "Send a message via webhook",
        inputSchema: {
          type: "object",
          properties: {
            webhookUrl: {
              type: "string",
              description: "Discord webhook link",
            },
            message: {
              type: "string",
              description: "Message content",
            },
          },
          required: ["webhookUrl", "message"],
        },
      }
];
