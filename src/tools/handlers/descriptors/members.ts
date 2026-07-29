import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const memberDescriptors: ToolDescriptor[] = [
  {
    name: "get_members",
    schema: schemas.GetMembersSchema,
    keys: ["guildId", "limit", "after"],
  },
  {
    name: "search_members",
    schema: schemas.SearchMembersSchema,
    keys: ["guildId", "query", "limit"],
  },
  {
    name: "edit_member",
    schema: schemas.EditMemberSchema,
    keys: ["guildId", "userId", "nickname", "roles"],
  },
  {
    name: "get_member_info",
    schema: schemas.GetMemberInfoSchema,
    keys: ["guildId", "userId"],
  },
];
