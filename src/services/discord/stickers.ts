import { PermissionFlagsBits, Sticker } from "discord.js";

import type { DiscordService } from "./service.js";

export const stickersMethods = {
  async createSticker(
    this: DiscordService,
    guildId?: string,
    name?: string,
    description?: string,
    tags?: string,
    imageUrl?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!name || !description || !tags || !imageUrl) {
      throw new Error(
        "Sticker name, description, tags, and image URL are required",
      );
    }

    // Check bot permissions
    const botMember = guild.members.cache.get(this.client.user!.id);
    if (
      !botMember?.permissions.has(PermissionFlagsBits.ManageGuildExpressions)
    ) {
      throw new Error("Bot doesn't have permission to manage stickers");
    }

    try {
      const stickerOptions = {
        name,
        description,
        tags,
        file: imageUrl,
        reason: "Sticker created via Discord MCP",
      };

      const sticker = await guild.stickers.create(stickerOptions);

      return `Successfully created sticker "${sticker.name}" (ID: ${sticker.id})
  - Description: ${sticker.description}
  - Tags: ${sticker.tags}
  - Format: ${sticker.format}`;
    } catch (error) {
      throw new Error(
        `Failed to create sticker: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async deleteSticker(
    this: DiscordService,
    guildId?: string,
    stickerId?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!stickerId) {
      throw new Error("Sticker ID is required");
    }

    // Check bot permissions
    const botMember = guild.members.cache.get(this.client.user!.id);
    if (
      !botMember?.permissions.has(PermissionFlagsBits.ManageGuildExpressions)
    ) {
      throw new Error("Bot doesn't have permission to manage stickers");
    }

    try {
      const sticker = guild.stickers.cache.get(stickerId);
      if (!sticker) {
        throw new Error("Sticker not found by stickerId");
      }

      const stickerName = sticker.name;
      await sticker.delete("Sticker deleted via Discord MCP");

      return `Successfully deleted sticker "${stickerName}" (ID: ${stickerId})`;
    } catch (error) {
      throw new Error(
        `Failed to delete sticker: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async getStickers(this: DiscordService, guildId?: string): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    try {
      const stickers = guild.stickers.cache;

      if (stickers.size === 0) {
        return "No custom stickers found in this server";
      }

      const formattedStickers = stickers.map((sticker: Sticker) => {
        const creator = sticker.user?.username || "Unknown";

        return `- **${sticker.name}** (ID: ${sticker.id})
    - Description: ${sticker.description || "No description"}
    - Tags: ${sticker.tags || "No tags"}
    - Format: ${sticker.format}
    - Created by: ${creator}`;
      });

      return `**Found ${stickers.size} custom stickers:**\n${formattedStickers.join("\n\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to fetch stickers: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export type StickersMethods = typeof stickersMethods;
