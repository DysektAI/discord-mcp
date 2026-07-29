import { z } from "zod";

export const UploadFileSchema = z.object({
  channelId: z.string().describe("Channel ID"),
  filePath: z.string().describe("Path to file or file URL"),
  fileName: z.string().optional().describe("Custom filename"),
  content: z.string().optional().describe("Message content to send with file"),
});
