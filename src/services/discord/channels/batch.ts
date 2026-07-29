import type { DiscordService } from "../service.js";

export const channelBatchMethods = {
  async comprehensiveChannelManagement(
    this: DiscordService,
    guildId: string | undefined,
    operations: any[],
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    const results: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      const operationId = `Operation ${i + 1} (${operation.action})`;

      try {
        let result = "";

        switch (operation.action) {
          case "create_text_channel":
            result = await this.createTextChannel(
              resolvedGuildId,
              operation.name,
              operation.categoryId,
            );
            break;

          case "create_voice_channel":
            result = await this.createVoiceChannel(
              resolvedGuildId,
              operation.name,
              operation.categoryId,
              operation.userLimit,
              operation.bitrate,
            );
            break;

          case "create_forum_channel":
            result = await this.createForumChannel(
              resolvedGuildId,
              operation.name,
              operation.categoryId,
              {
                topic: operation.topic,
                slowmode: operation.slowmode,
                defaultReactionEmoji: operation.defaultReactionEmoji,
                isPrivate: operation.isPrivate,
                allowedRoles: operation.allowedRoles,
              },
            );
            break;

          case "create_announcement_channel":
            result = await this.createAnnouncementChannel(
              resolvedGuildId,
              operation.name,
              operation.categoryId,
              {
                topic: operation.topic,
                slowmode: operation.slowmode,
                isPrivate: operation.isPrivate,
                allowedRoles: operation.allowedRoles,
              },
            );
            break;

          case "create_stage_channel":
            result = await this.createStageChannel(
              resolvedGuildId,
              operation.name,
              operation.categoryId,
              {
                topic: operation.topic,
                bitrate: operation.bitrate,
                isPrivate: operation.isPrivate,
                allowedRoles: operation.allowedRoles,
              },
            );
            break;

          case "create_category":
            result = await this.createCategory(resolvedGuildId, operation.name);
            break;

          case "edit_channel_advanced":
            if (!operation.channelId) {
              throw new Error("channelId required for edit_channel_advanced");
            }
            result = await this.editChannelAdvanced(
              resolvedGuildId,
              operation.channelId,
              {
                name: operation.name,
                topic: operation.topic,
                slowmode: operation.slowmode,
                userLimit: operation.userLimit,
                bitrate: operation.bitrate,
                isPrivate: operation.isPrivate,
                allowedRoles: operation.allowedRoles,
                categoryId: operation.categoryId,
              },
            );
            break;

          case "delete_channel":
            if (!operation.channelId) {
              throw new Error("channelId required for delete_channel");
            }
            result = await this.deleteChannel(
              resolvedGuildId,
              operation.channelId,
            );
            break;

          case "delete_category":
            if (!operation.targetCategoryId) {
              throw new Error("targetCategoryId required for delete_category");
            }
            result = await this.deleteCategory(
              resolvedGuildId,
              operation.targetCategoryId,
            );
            break;

          case "set_channel_position":
            if (!operation.channelId || operation.position === undefined) {
              throw new Error(
                "channelId and position required for set_channel_position",
              );
            }
            result = await this.setChannelPosition(
              resolvedGuildId,
              operation.channelId,
              operation.position,
            );
            break;

          case "set_category_position":
            if (
              !operation.targetCategoryId ||
              operation.position === undefined
            ) {
              throw new Error(
                "targetCategoryId and position required for set_category_position",
              );
            }
            result = await this.setCategoryPosition(
              resolvedGuildId,
              operation.targetCategoryId,
              operation.position,
            );
            break;

          case "move_channel_to_category":
            if (!operation.channelId) {
              throw new Error(
                "channelId required for move_channel_to_category",
              );
            }
            result = await this.moveChannelToCategory(
              resolvedGuildId,
              operation.channelId,
              operation.categoryId,
            );
            break;

          case "set_channel_private":
            if (!operation.channelId || operation.isPrivate === undefined) {
              throw new Error(
                "channelId and isPrivate required for set_channel_private",
              );
            }
            result = await this.setChannelPrivate(
              resolvedGuildId,
              operation.channelId,
              {
                isPrivate: operation.isPrivate,
                allowedRoles: operation.allowedRoles,
                allowedMembers: operation.allowedMembers,
                syncToCategory: operation.syncToCategory,
              },
            );
            break;

          case "set_category_private":
            if (
              !operation.targetCategoryId ||
              operation.isPrivate === undefined
            ) {
              throw new Error(
                "targetCategoryId and isPrivate required for set_category_private",
              );
            }
            result = await this.setCategoryPrivate(
              resolvedGuildId,
              operation.targetCategoryId,
              {
                isPrivate: operation.isPrivate,
                allowedRoles: operation.allowedRoles,
                allowedMembers: operation.allowedMembers,
                applyToChannels: operation.applyToChannels,
              },
            );
            break;

          default:
            throw new Error(`Unknown action: ${operation.action}`);
        }

        results.push(`Γ£à ${operationId}: ${result}`);
        successCount++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.push(`Γ¥î ${operationId}: ${errorMsg}`);
        failureCount++;
      }
    }

    const summary = [
      `Comprehensive Channel Management completed: ${successCount} succeeded, ${failureCount} failed`,
      "",
      "Detailed Results:",
      ...results,
    ];

    return summary.join("\n");
  },
};

export type ChannelBatchMethods = typeof channelBatchMethods;
