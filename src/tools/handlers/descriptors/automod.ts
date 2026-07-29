import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const automodDescriptors: ToolDescriptor[] = [
  {
    name: "create_automod_rule",
    schema: schemas.CreateAutomodRuleSchema,
    keys: [
      "guildId",
      "name",
      "eventType",
      "triggerType",
      "keywordFilter",
      "presets",
      "allowList",
      "mentionLimit",
      "enabled",
    ],
  },
  {
    name: "edit_automod_rule",
    schema: schemas.EditAutomodRuleSchema,
    keys: [
      "guildId",
      "ruleId",
      "name",
      "enabled",
      "keywordFilter",
      "allowList",
      "mentionLimit",
    ],
  },
  {
    name: "delete_automod_rule",
    schema: schemas.DeleteAutomodRuleSchema,
    keys: ["guildId", "ruleId"],
  },
  {
    name: "get_automod_rules",
    schema: schemas.GetAutomodRulesSchema,
    keys: ["guildId"],
  },
];
