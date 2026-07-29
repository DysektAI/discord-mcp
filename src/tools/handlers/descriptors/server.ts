import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const serverDescriptors: ToolDescriptor[] = [
  {
    name: "get_server_info",
    schema: schemas.ServerInfoSchema,
    keys: ["guildId"],
  },
  {
    name: "get_server_stats",
    schema: schemas.GetServerStatsSchema,
    keys: ["guildId"],
  },
  {
    name: "get_server_widget",
    schema: schemas.GetServerWidgetSchema,
    keys: ["guildId"],
  },
  {
    name: "get_welcome_screen",
    schema: schemas.GetWelcomeScreenSchema,
    keys: ["guildId"],
  },
  {
    name: "edit_welcome_screen",
    schema: schemas.EditWelcomeScreenSchema,
    keys: ["guildId", "enabled", "description", "welcomeChannels"],
  },
  {
    name: "edit_server",
    schema: schemas.EditServerSchema,
    keys: [
      "guildId",
      "name",
      "description",
      "icon",
      "banner",
      "verificationLevel",
    ],
  },
];
