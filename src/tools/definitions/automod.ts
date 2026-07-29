export const automodTools = [
  {
        name: "create_automod_rule",
        description: "Create an automoderation rule",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Rule name",
            },
            eventType: {
              type: "string",
              enum: ["MESSAGE_SEND"],
              description: "Event type to trigger on",
            },
            triggerType: {
              type: "string",
              enum: ["KEYWORD", "SPAM", "KEYWORD_PRESET", "MENTION_SPAM"],
              description: "Trigger type",
            },
            keywordFilter: {
              type: "array",
              items: { type: "string" },
              description: "Keywords to filter",
            },
            presets: {
              type: "array",
              items: { type: "string" },
              description: "Preset keyword lists",
            },
            allowList: {
              type: "array",
              items: { type: "string" },
              description: "Allowed words",
            },
            mentionLimit: {
              type: "number",
              description: "Max mentions allowed",
            },
            enabled: {
              type: "boolean",
              description: "Whether rule is enabled",
            },
          },
          required: ["name", "eventType", "triggerType"],
        },
      },
  {
        name: "edit_automod_rule",
        description: "Edit an existing automoderation rule",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            ruleId: {
              type: "string",
              description: "Automod rule ID",
            },
            name: {
              type: "string",
              description: "New rule name",
            },
            enabled: {
              type: "boolean",
              description: "Whether rule is enabled",
            },
            keywordFilter: {
              type: "array",
              items: { type: "string" },
              description: "Keywords to filter",
            },
            allowList: {
              type: "array",
              items: { type: "string" },
              description: "Allowed words",
            },
            mentionLimit: {
              type: "number",
              description: "Max mentions allowed",
            },
          },
          required: ["ruleId"],
        },
      },
  {
        name: "delete_automod_rule",
        description: "Delete an automoderation rule",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            ruleId: {
              type: "string",
              description: "Automod rule ID",
            },
          },
          required: ["ruleId"],
        },
      },
  {
        name: "get_automod_rules",
        description: "List all automoderation rules in the server",
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
