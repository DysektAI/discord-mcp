import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const privateMessageDescriptors: ToolDescriptor[] = [
  {
    name: "get_user_id_by_name",
    schema: schemas.GetUserIdByNameSchema,
    keys: ["username", "guildId"],
  },
  {
    name: "send_private_message",
    schema: schemas.SendPrivateMessageSchema,
    keys: ["userId", "message"],
  },
  {
    name: "edit_private_message",
    schema: schemas.EditPrivateMessageSchema,
    keys: ["userId", "messageId", "newMessage"],
  },
  {
    name: "delete_private_message",
    schema: schemas.DeletePrivateMessageSchema,
    keys: ["userId", "messageId"],
  },
  {
    name: "read_private_messages",
    schema: schemas.ReadPrivateMessagesSchema,
    keys: ["userId", "count"],
  },
];
