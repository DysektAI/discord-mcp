import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const roleDescriptors: ToolDescriptor[] = [
  {
    name: "create_role",
    schema: schemas.CreateRoleSchema,
    keys: ["guildId", "name", "color", "permissions"],
  },
  {
    name: "delete_role",
    schema: schemas.DeleteRoleSchema,
    keys: ["guildId", "roleId"],
  },
  {
    name: "edit_role",
    schema: schemas.EditRoleSchema,
    keys: ["guildId", "roleId", "name", "color", "permissions"],
  },
  {
    name: "add_role_to_member",
    schema: schemas.AddRoleToMemberSchema,
    keys: ["guildId", "userId", "roleId"],
  },
  {
    name: "remove_role_from_member",
    schema: schemas.RemoveRoleFromMemberSchema,
    keys: ["guildId", "userId", "roleId"],
  },
  {
    name: "get_roles",
    schema: schemas.GetRolesSchema,
    keys: ["guildId"],
  },
  {
    name: "set_role_positions",
    schema: schemas.SetRolePositionsSchema,
    keys: ["rolePositions"],
  },
];
