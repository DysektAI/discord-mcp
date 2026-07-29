import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const webhookDescriptors: ToolDescriptor[] = [
  {
    name: "create_webhook",
    schema: schemas.CreateWebhookSchema,
    keys: ["channelId", "name"],
  },
  {
    name: "delete_webhook",
    schema: schemas.DeleteWebhookSchema,
    keys: ["webhookId"],
  },
  {
    name: "list_webhooks",
    schema: schemas.ListWebhooksSchema,
    keys: ["channelId"],
  },
  {
    name: "send_webhook_message",
    schema: schemas.SendWebhookMessageSchema,
    keys: ["webhookUrl", "message"],
  },
];
