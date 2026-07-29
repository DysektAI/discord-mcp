import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const messageDescriptors: ToolDescriptor[] = [
  {
    name: "send_message",
    schema: schemas.SendMessageSchema,
    keys: ["channelId", "message"],
  },
  {
    name: "reply_message",
    schema: schemas.ReplyMessageSchema,
    keys: ["channelId", "messageId", "message"],
  },
  {
    name: "edit_message",
    schema: schemas.EditMessageSchema,
    keys: ["channelId", "messageId", "newMessage"],
  },
  {
    name: "delete_message",
    schema: schemas.DeleteMessageSchema,
    keys: ["channelId", "messageId"],
  },
  {
    name: "read_messages",
    schema: schemas.ReadMessagesSchema,
    keys: ["channelId", "count"],
  },
  {
    name: "pin_message",
    schema: schemas.PinMessageSchema,
    keys: ["channelId", "messageId"],
  },
  {
    name: "unpin_message",
    schema: schemas.UnpinMessageSchema,
    keys: ["channelId", "messageId"],
  },
  {
    name: "get_pinned_messages",
    schema: schemas.GetPinnedMessagesSchema,
    keys: ["channelId"],
  },
  {
    name: "bulk_delete_messages",
    schema: schemas.BulkDeleteMessagesSchema,
    keys: [
      "channelId",
      "messageIds",
      "filterOld",
      "confirm",
      "deleteOldIndividually",
    ],
  },
  {
    name: "crosspost_message",
    schema: schemas.CrosspostMessageSchema,
    keys: ["channelId", "messageId"],
  },
  {
    name: "add_reaction",
    schema: schemas.AddReactionSchema,
    keys: ["channelId", "messageId", "emoji"],
  },
  {
    name: "remove_reaction",
    schema: schemas.RemoveReactionSchema,
    keys: ["channelId", "messageId", "emoji"],
  },
  {
    name: "get_message_attachments",
    schema: schemas.GetMessageAttachmentsSchema,
    keys: ["channelId", "messageId"],
  },
  {
    name: "read_images",
    schema: schemas.ReadImagesSchema,
    keys: [
      "channelId",
      "messageId",
      "limit",
      "includeMetadata",
      "downloadImages",
    ],
  },
  {
    name: "get_message_history",
    schema: schemas.GetMessageHistorySchema,
    keys: ["channelId", "limit", "before", "after"],
  },
  {
    name: "export_chat_log",
    schema: schemas.ExportChatLogSchema,
    keys: ["channelId", "format", "limit", "dateRange"],
  },
];
