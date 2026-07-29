export const filesTools = [
  {
        name: "upload_file",
        description: "Upload a file to a channel",
        inputSchema: {
          type: "object",
          properties: {
            channelId: {
              type: "string",
              description: "Channel ID",
            },
            filePath: {
              type: "string",
              description: "Path to file or file URL",
            },
            fileName: {
              type: "string",
              description: "Custom filename",
            },
            content: {
              type: "string",
              description: "Message content to send with file",
            },
          },
          required: ["channelId", "filePath"],
        },
      }
];
