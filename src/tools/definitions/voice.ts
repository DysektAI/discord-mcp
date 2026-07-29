export const voiceTools = [
  {
        name: "join_voice_channel",
        description: "Connect bot to voice channel",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            channelId: {
              type: "string",
              description: "Voice channel ID",
            },
          },
          required: ["guildId", "channelId"],
        },
      },
  {
        name: "leave_voice_channel",
        description: "Disconnect from voice channel",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
          },
          required: ["guildId"],
        },
      },
  {
        name: "play_audio",
        description: "Stream audio in voice channel",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            audioUrl: {
              type: "string",
              description: "URL or path to audio file",
            },
          },
          required: ["guildId", "audioUrl"],
        },
      },
  {
        name: "stop_audio",
        description: "Stop current audio playback",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
          },
          required: ["guildId"],
        },
      },
  {
        name: "set_volume",
        description: "Adjust audio volume",
        inputSchema: {
          type: "object",
          properties: {
            guildId: {
              type: "string",
              description: "Discord server ID",
            },
            volume: {
              type: "number",
              description: "Volume level (0-200)",
              minimum: 0,
              maximum: 200,
            },
          },
          required: ["guildId", "volume"],
        },
      },
  {
        name: "get_voice_connections",
        description: "List active voice connections",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      }
];
