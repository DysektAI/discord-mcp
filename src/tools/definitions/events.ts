export const eventsTools = [
  {
        name: "create_event",
        description: "Create a scheduled Discord event",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            name: {
              type: "string",
              description: "Event name",
            },
            description: {
              type: "string",
              description: "Event description",
            },
            startTime: {
              type: "string",
              description: "Event start time (ISO 8601 format)",
            },
            endTime: {
              type: "string",
              description: "Event end time (ISO 8601 format)",
            },
            location: {
              type: "string",
              description: "Event location for external events",
            },
            channelId: {
              type: "string",
              description: "Voice channel ID for voice events",
            },
          },
          required: ["name", "startTime"],
        },
      },
  {
        name: "edit_event",
        description: "Edit an existing scheduled event",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            eventId: {
              type: "string",
              description: "Event ID",
            },
            name: {
              type: "string",
              description: "New event name",
            },
            description: {
              type: "string",
              description: "New event description",
            },
            startTime: {
              type: "string",
              description: "New start time (ISO 8601 format)",
            },
            endTime: {
              type: "string",
              description: "New end time (ISO 8601 format)",
            },
            location: {
              type: "string",
              description: "New event location",
            },
          },
          required: ["eventId"],
        },
      },
  {
        name: "delete_event",
        description: "Delete a scheduled event",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            eventId: {
              type: "string",
              description: "Event ID",
            },
          },
          required: ["eventId"],
        },
      },
  {
        name: "get_events",
        description: "List all scheduled events in the server",
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
