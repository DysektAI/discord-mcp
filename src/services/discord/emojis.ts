import { PermissionFlagsBits, GuildEmoji } from "discord.js";

import type { DiscordService } from "./service.js";

export const emojisMethods = {
  async createEmoji(
    this: DiscordService,
    guildId?: string,
    name?: string,
    imageUrl?: string,
    roles?: string[],
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!name || !imageUrl) {
      throw new Error("Emoji name and image URL are required");
    }

    // Check bot permissions
    const botMember = guild.members.cache.get(this.client.user!.id);
    if (
      !botMember?.permissions.has(PermissionFlagsBits.ManageGuildExpressions)
    ) {
      throw new Error("Bot doesn't have permission to manage emojis");
    }

    try {
      const emojiOptions: any = {
        name,
        attachment: imageUrl,
        reason: "Emoji created via Discord MCP",
      };

      if (roles && roles.length > 0) {
        const roleObjects = roles.map((roleId) => {
          const role = guild.roles.cache.get(roleId);
          if (!role) {
            throw new Error(`Role not found: ${roleId}`);
          }
          return role;
        });
        emojiOptions.roles = roleObjects;
      }

      const emoji = await guild.emojis.create(emojiOptions);

      const roleList =
        roles && roles.length > 0
          ? `\n- Restricted to roles: ${roles.map((id) => guild.roles.cache.get(id)?.name).join(", ")}`
          : "\n- Available to everyone";

      return `Successfully created emoji ${emoji.name} (ID: ${emoji.id})
  - Animated: ${emoji.animated ? "Yes" : "No"}
  - Usage: <:${emoji.name}:${emoji.id}>${roleList}`;
    } catch (error) {
      throw new Error(
        `Failed to create emoji: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async deleteEmoji(
    this: DiscordService,
    guildId?: string,
    emojiId?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!emojiId) {
      throw new Error("Emoji ID is required");
    }

    // Check bot permissions
    const botMember = guild.members.cache.get(this.client.user!.id);
    if (
      !botMember?.permissions.has(PermissionFlagsBits.ManageGuildExpressions)
    ) {
      throw new Error("Bot doesn't have permission to manage emojis");
    }

    try {
      const emoji = guild.emojis.cache.get(emojiId);
      if (!emoji) {
        throw new Error("Emoji not found by emojiId");
      }

      const emojiName = emoji.name;
      await emoji.delete("Emoji deleted via Discord MCP");

      return `Successfully deleted emoji ${emojiName} (ID: ${emojiId})`;
    } catch (error) {
      throw new Error(
        `Failed to delete emoji: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async getEmojis(this: DiscordService, guildId?: string): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    try {
      const emojis = guild.emojis.cache;

      if (emojis.size === 0) {
        return "No custom emojis found in this server";
      }

      const formattedEmojis = emojis.map((emoji: GuildEmoji) => {
        const creator = emoji.author?.username || "Unknown";
        const roleRestrictions =
          emoji.roles.cache.size > 0
            ? `\n  - Restricted to: ${emoji.roles.cache.map((role) => role.name).join(", ")}`
            : "\n  - Available to everyone";

        return `- **${emoji.name}** (ID: ${emoji.id})
    - Usage: <:${emoji.name}:${emoji.id}>
    - Animated: ${emoji.animated ? "Yes" : "No"}
    - Created by: ${creator}${roleRestrictions}`;
      });

      return `**Found ${emojis.size} custom emojis:**\n${formattedEmojis.join("\n\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to fetch emojis: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export type EmojisMethods = typeof emojisMethods;
