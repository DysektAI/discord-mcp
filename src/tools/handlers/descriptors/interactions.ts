import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const interactionDescriptors: ToolDescriptor[] = [
  {
    name: "send_modal",
    schema: schemas.SendModalSchema,
    keys: ["interactionId", "title", "customId", "components"],
  },
  {
    name: "send_embed",
    schema: schemas.SendEmbedSchema,
    keys: [
      "channelId",
      "title",
      "description",
      "color",
      "fields",
      "footer",
      "image",
      "thumbnail",
    ],
  },
  {
    name: "send_button",
    schema: schemas.SendButtonSchema,
    keys: ["channelId", "content", "buttons"],
  },
  {
    name: "send_select_menu",
    schema: schemas.SendSelectMenuSchema,
    keys: [
      "channelId",
      "content",
      "customId",
      "placeholder",
      "minValues",
      "maxValues",
      "options",
    ],
  },
];
