import { z } from "zod";

export const SendMessageSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  message: z.string().describe("Message content"),
});

export const ReplyMessageSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  messageId: z.string().describe("Message ID to reply to"),
  message: z.string().describe("Reply message content"),
});

export const EditMessageSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  messageId: z.string().describe("Specific message ID"),
  newMessage: z.string().describe("New message content"),
});

export const DeleteMessageSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  messageId: z.string().describe("Specific message ID"),
});

export const ReadMessagesSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  count: z.string().optional().describe("Number of messages to retrieve"),
});

export const AddReactionSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  messageId: z.string().describe("Discord message ID"),
  emoji: z.string().describe("Emoji (Unicode or string)"),
});

export const RemoveReactionSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  messageId: z.string().describe("Discord message ID"),
  emoji: z.string().describe("Emoji (Unicode or string)"),
});

export const PinMessageSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  messageId: z.string().describe("Message ID to pin"),
});

export const UnpinMessageSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  messageId: z.string().describe("Message ID to unpin"),
});

export const GetPinnedMessagesSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
});

export const BulkDeleteMessagesSchema = z.object({
  channelId: z.string().describe("Discord channel ID"),
  messageIds: z.preprocess(
    (value) => value ?? [],
    z
      .array(z.string())
      .nonempty(
        "messageIds is required (provide explicit message IDs; this tool does not auto-select messages)",
      ),
  ),
  filterOld: z
    .boolean()
    .optional()
    .describe("Filter out messages older than 14 days"),
  deleteOldIndividually: z
    .boolean()
    .optional()
    .describe("Delete messages older than 14 days one by one"),
  confirm: z
    .boolean()
    .optional()
    .describe("Set true to execute deletion after preview"),
});

export const CrosspostMessageSchema = z.object({
  channelId: z.string().describe("Announcement channel ID"),
  messageId: z.string().describe("Message ID to crosspost"),
});

export const GetMessageAttachmentsSchema = z.object({
  channelId: z.string().describe("Channel ID"),
  messageId: z.string().describe("Message ID"),
});

export const ReadImagesSchema = z.object({
  channelId: z.string().describe("Channel ID"),
  messageId: z
    .string()
    .optional()
    .describe(
      "Specific message ID (optional - if not provided, reads latest image)",
    ),
  limit: z
    .number()
    .min(1)
    .max(10)
    .default(1)
    .describe("Number of recent messages to search for images"),
  includeMetadata: z
    .boolean()
    .default(true)
    .describe("Include image metadata (dimensions, file size, etc.)"),
  downloadImages: z
    .boolean()
    .default(false)
    .describe("Download and analyze image content (slower but more detailed)"),
});

export const GetMessageHistorySchema = z.object({
  channelId: z.string().describe("Channel ID"),
  limit: z
    .number()
    .optional()
    .describe("Number of messages to fetch (0 or unset = all)"),
  before: z.string().optional().describe("Message ID to fetch before"),
  after: z.string().optional().describe("Message ID to fetch after"),
});

export const ExportChatLogSchema = z.object({
  channelId: z.string().describe("Channel ID"),
  format: z.enum(["JSON", "CSV", "TXT"]).describe("Export format"),
  limit: z.number().optional().describe("Number of messages to export"),
  dateRange: z
    .object({
      start: z.string().describe("Start date (ISO 8601)"),
      end: z.string().describe("End date (ISO 8601)"),
    })
    .optional()
    .describe("Date range filter"),
});
