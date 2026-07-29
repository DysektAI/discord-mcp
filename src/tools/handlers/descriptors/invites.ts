import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const inviteDescriptors: ToolDescriptor[] = [
  {
    name: "create_invite",
    schema: schemas.CreateInviteSchema,
    keys: ["channelId", "maxUses", "maxAge", "temporary", "unique"],
  },
  {
    name: "delete_invite",
    schema: schemas.DeleteInviteSchema,
    keys: ["inviteCode"],
  },
  {
    name: "get_invites",
    schema: schemas.GetInvitesSchema,
    keys: ["guildId"],
  },
];
