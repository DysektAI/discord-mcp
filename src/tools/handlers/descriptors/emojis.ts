import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const emojiDescriptors: ToolDescriptor[] = [
  {
    name: "create_emoji",
    schema: schemas.CreateEmojiSchema,
    keys: ["guildId", "name", "imageUrl"],
  },
  {
    name: "delete_emoji",
    schema: schemas.DeleteEmojiSchema,
    keys: ["guildId", "emojiId"],
  },
  {
    name: "get_emojis",
    schema: schemas.GetEmojisSchema,
    keys: ["guildId"],
  },
];
