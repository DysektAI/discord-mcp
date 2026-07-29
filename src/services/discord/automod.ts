import {
  PermissionFlagsBits,
  AutoModerationRuleTriggerType,
  AutoModerationRuleEventType,
  AutoModerationActionType,
} from "discord.js";

import type { DiscordService } from "./service.js";

export const automodMethods = {
  async createAutomodRule(
    this: DiscordService,
    guildId?: string,
    name?: string,
    eventType?: string,
    triggerType?: string,
    keywordFilter?: string[],
    presets?: string[],
    allowList?: string[],
    mentionLimit?: number,
    enabled?: boolean,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!name || !eventType || !triggerType) {
      throw new Error("Rule name, event type, and trigger type are required");
    }

    // Check permissions
    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      throw new Error(
        "Bot requires 'Manage Server' permission to create automod rules",
      );
    }

    try {
      let triggerTypeEnum: AutoModerationRuleTriggerType;
      let eventTypeEnum: AutoModerationRuleEventType;

      // Map trigger type
      switch (triggerType.toUpperCase()) {
        case "KEYWORD":
          triggerTypeEnum = AutoModerationRuleTriggerType.Keyword;
          break;
        case "SPAM":
          triggerTypeEnum = AutoModerationRuleTriggerType.Spam;
          break;
        case "KEYWORD_PRESET":
          triggerTypeEnum = AutoModerationRuleTriggerType.KeywordPreset;
          break;
        case "MENTION_SPAM":
          triggerTypeEnum = AutoModerationRuleTriggerType.MentionSpam;
          break;
        default:
          throw new Error(`Invalid trigger type: ${triggerType}`);
      }

      // Map event type
      switch (eventType.toUpperCase()) {
        case "MESSAGE_SEND":
          eventTypeEnum = AutoModerationRuleEventType.MessageSend;
          break;
        default:
          throw new Error(`Invalid event type: ${eventType}`);
      }

      const ruleOptions: any = {
        name: name,
        eventType: eventTypeEnum,
        triggerType: triggerTypeEnum,
        enabled: enabled !== false,
        actions: [
          {
            type: AutoModerationActionType.BlockMessage,
          },
        ],
      };

      // Add trigger metadata based on type
      if (
        triggerTypeEnum === AutoModerationRuleTriggerType.Keyword &&
        keywordFilter
      ) {
        ruleOptions.triggerMetadata = {
          keywordFilter: keywordFilter,
          allowList: allowList || [],
        };
      } else if (
        triggerTypeEnum === AutoModerationRuleTriggerType.MentionSpam &&
        mentionLimit
      ) {
        ruleOptions.triggerMetadata = {
          mentionTotalLimit: mentionLimit,
        };
      } else if (
        triggerTypeEnum === AutoModerationRuleTriggerType.KeywordPreset &&
        presets
      ) {
        ruleOptions.triggerMetadata = {
          presets: presets,
        };
      }

      const rule = await guild.autoModerationRules.create(ruleOptions);

      return `Successfully created automod rule "${rule.name}" (ID: ${rule.id})
  - Event Type: ${eventType}
  - Trigger Type: ${triggerType}
  - Enabled: ${rule.enabled}
  - Actions: Block Message`;
    } catch (error) {
      throw new Error(
        `Failed to create automod rule: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async editAutomodRule(
    this: DiscordService,
    guildId?: string,
    ruleId?: string,
    name?: string,
    enabled?: boolean,
    keywordFilter?: string[],
    allowList?: string[],
    mentionLimit?: number,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!ruleId) {
      throw new Error("Rule ID is required");
    }

    // Check permissions
    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      throw new Error(
        "Bot requires 'Manage Server' permission to edit automod rules",
      );
    }

    try {
      const rule = await guild.autoModerationRules.fetch(ruleId);
      if (!rule) {
        throw new Error("Automod rule not found by ruleId");
      }

      const editOptions: any = {};
      const changes: string[] = [];

      if (name && name !== rule.name) {
        editOptions.name = name;
        changes.push(`Name: "${rule.name}" ΓåÆ "${name}"`);
      }

      if (enabled !== undefined && enabled !== rule.enabled) {
        editOptions.enabled = enabled;
        changes.push(`Enabled: ${rule.enabled} ΓåÆ ${enabled}`);
      }

      // Update trigger metadata if provided
      if (keywordFilter || allowList || mentionLimit !== undefined) {
        const triggerMetadata: any = { ...rule.triggerMetadata };

        if (keywordFilter) {
          triggerMetadata.keywordFilter = keywordFilter;
          changes.push(`Keywords updated (${keywordFilter.length} keywords)`);
        }

        if (allowList) {
          triggerMetadata.allowList = allowList;
          changes.push(`Allow list updated (${allowList.length} items)`);
        }

        if (mentionLimit !== undefined) {
          triggerMetadata.mentionTotalLimit = mentionLimit;
          changes.push(
            `Mention limit: ${rule.triggerMetadata?.mentionTotalLimit || "None"} ΓåÆ ${mentionLimit}`,
          );
        }

        editOptions.triggerMetadata = triggerMetadata;
      }

      if (changes.length === 0) {
        return "No changes specified for the automod rule";
      }

      const updatedRule = await rule.edit(editOptions);

      return `Successfully edited automod rule "${updatedRule.name}" (ID: ${updatedRule.id})
  Changes made:
  ${changes.map((change) => `- ${change}`).join("\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to edit automod rule: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async deleteAutomodRule(
    this: DiscordService,
    guildId?: string,
    ruleId?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!ruleId) {
      throw new Error("Rule ID is required");
    }

    // Check permissions
    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      throw new Error(
        "Bot requires 'Manage Server' permission to delete automod rules",
      );
    }

    try {
      const rule = await guild.autoModerationRules.fetch(ruleId);
      if (!rule) {
        throw new Error("Automod rule not found by ruleId");
      }

      const ruleName = rule.name;
      await rule.delete();

      return `Successfully deleted automod rule "${ruleName}" (ID: ${ruleId})`;
    } catch (error) {
      throw new Error(
        `Failed to delete automod rule: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async getAutomodRules(
    this: DiscordService,
    guildId?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    try {
      const rules = await guild.autoModerationRules.fetch();

      if (rules.size === 0) {
        return "No automod rules found in this server";
      }

      const formattedRules = rules.map((rule) => {
        const triggerType =
          Object.keys(AutoModerationRuleTriggerType)[
            Object.values(AutoModerationRuleTriggerType).indexOf(
              rule.triggerType as any,
            )
          ] || "Unknown";
        const eventType =
          Object.keys(AutoModerationRuleEventType)[
            Object.values(AutoModerationRuleEventType).indexOf(
              rule.eventType as any,
            )
          ] || "Unknown";

        let metadata = "";
        if (rule.triggerMetadata) {
          if (rule.triggerMetadata.keywordFilter?.length) {
            metadata += `\n  - Keywords: ${rule.triggerMetadata.keywordFilter.length} items`;
          }
          if (rule.triggerMetadata.allowList?.length) {
            metadata += `\n  - Allow List: ${rule.triggerMetadata.allowList.length} items`;
          }
          if (rule.triggerMetadata.mentionTotalLimit) {
            metadata += `\n  - Mention Limit: ${rule.triggerMetadata.mentionTotalLimit}`;
          }
        }

        return `**${rule.name}** (ID: ${rule.id})
    - Enabled: ${rule.enabled ? "Γ£à" : "Γ¥î"}
    - Event Type: ${eventType}
    - Trigger Type: ${triggerType}
    - Actions: ${rule.actions.length} configured${metadata}`;
      });

      return `**Found ${rules.size} automod rules:**\n\n${formattedRules.join("\n\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to get automod rules: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export type AutomodMethods = typeof automodMethods;
