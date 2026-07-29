import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const stickerDescriptors: ToolDescriptor[] = [
  {
    name: "create_sticker",
    schema: schemas.CreateStickerSchema,
    keys: ["guildId", "name", "description", "tags", "fileUrl"],
  },
  {
    name: "delete_sticker",
    schema: schemas.DeleteStickerSchema,
    keys: ["guildId", "stickerId"],
  },
  {
    name: "get_stickers",
    schema: schemas.GetStickersSchema,
    keys: ["guildId"],
  },
];
