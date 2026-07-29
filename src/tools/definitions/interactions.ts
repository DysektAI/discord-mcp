export const interactionsTools = [
  {
        name: "send_modal",
        description: "Send a modal dialog (requires active interaction context)",
        inputSchema: {
          type: "object",
          properties: {
            interactionId: {
              type: "string",
              description: "Interaction ID",
            },
            title: {
              type: "string",
              description: "Modal title",
            },
            customId: {
              type: "string",
              description: "Custom ID for the modal",
            },
            components: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "number", description: "Component type" },
                  label: { type: "string", description: "Component label" },
                  style: { type: "number", description: "Component style" },
                  placeholder: {
                    type: "string",
                    description: "Placeholder text",
                  },
                  required: {
                    type: "boolean",
                    description: "Whether field is required",
                  },
                },
              },
              description: "Modal components",
            },
          },
          required: ["interactionId", "title", "customId", "components"],
        },
      },
  {
        name: "send_embed",
        description: "Send a rich embed message to a channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            title: {
              type: "string",
              description: "Embed title",
            },
            description: {
              type: "string",
              description: "Embed description",
            },
            color: {
              type: "string",
              description: "Embed color (hex)",
            },
            fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Field name" },
                  value: { type: "string", description: "Field value" },
                  inline: {
                    type: "boolean",
                    description: "Whether field is inline",
                  },
                },
              },
              description: "Embed fields",
            },
            footer: {
              type: "string",
              description: "Footer text",
            },
            image: {
              type: "string",
              description: "Image URL",
            },
            thumbnail: {
              type: "string",
              description: "Thumbnail URL",
            },
          },
          required: ["channelId"],
        },
      },
  {
        name: "send_button",
        description: "Send a message with interactive buttons",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            content: {
              type: "string",
              description: "Message content",
            },
            buttons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string", description: "Button label" },
                  style: {
                    type: "string",
                    enum: ["PRIMARY", "SECONDARY", "SUCCESS", "DANGER", "LINK"],
                    description: "Button style",
                  },
                  customId: {
                    type: "string",
                    description: "Custom ID for the button",
                  },
                  url: { type: "string", description: "URL for link buttons" },
                  emoji: { type: "string", description: "Button emoji" },
                },
              },
              description: "Button components",
            },
          },
          required: ["channelId", "buttons"],
        },
      },
  {
        name: "send_select_menu",
        description: "Send a message with a select menu",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            content: {
              type: "string",
              description: "Message content",
            },
            customId: {
              type: "string",
              description: "Custom ID for the select menu",
            },
            placeholder: {
              type: "string",
              description: "Placeholder text",
            },
            minValues: {
              type: "number",
              description: "Minimum values to select",
            },
            maxValues: {
              type: "number",
              description: "Maximum values to select",
            },
            options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string", description: "Option label" },
                  value: { type: "string", description: "Option value" },
                  description: {
                    type: "string",
                    description: "Option description",
                  },
                  emoji: { type: "string", description: "Option emoji" },
                },
              },
              description: "Select menu options",
            },
          },
          required: ["channelId", "options"],
        },
      }
];
