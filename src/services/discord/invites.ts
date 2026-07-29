import {
  TextChannel,
  VoiceChannel,
  StageChannel,
  ChannelType,
  Invite,
} from "discord.js";

import type { DiscordService } from "./service.js";

export const invitesMethods = {
  async createInvite(
    this: DiscordService,
    channelId?: string,
    maxAge?: number,
    maxUses?: number,
    temporary?: boolean,
  ): Promise<string> {
    this.ensureReady();

    if (!channelId) {
      throw new Error("Channel ID is required");
    }

    const channel = this.client.channels.cache.get(channelId);
    if (!channel) {
      throw new Error("Channel not found by channelId");
    }

    // Check if the channel supports invites
    if (
      channel.type !== ChannelType.GuildText &&
      channel.type !== ChannelType.GuildVoice &&
      channel.type !== ChannelType.GuildStageVoice &&
      channel.type !== ChannelType.GuildAnnouncement
    ) {
      throw new Error("Channel does not support invite creation");
    }

    const guildChannel = channel as TextChannel | VoiceChannel | StageChannel;

    try {
      const inviteOptions: any = {
        maxAge: maxAge || 0, // 0 = never expires
        maxUses: maxUses || 0, // 0 = unlimited uses
        temporary: temporary || false,
        unique: true,
      };

      const invite = await guildChannel.createInvite(inviteOptions);

      const expiresText = maxAge === 0 ? "Never" : `${maxAge} seconds`;
      const usesText = maxUses === 0 ? "Unlimited" : `${maxUses}`;

      return `Successfully created invite: ${invite.url}
  - Code: ${invite.code}
  - Channel: ${guildChannel.name}
  - Expires: ${expiresText}
  - Max Uses: ${usesText}
  - Temporary: ${temporary ? "Yes" : "No"}`;
    } catch (error) {
      throw new Error(
        `Failed to create invite: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async deleteInvite(
    this: DiscordService,
    inviteCode?: string,
  ): Promise<string> {
    this.ensureReady();

    if (!inviteCode) {
      throw new Error("Invite code is required");
    }

    try {
      const invite = await this.client.fetchInvite(inviteCode);
      if (!invite) {
        throw new Error("Invite not found by invite code");
      }

      await invite.delete();

      return `Successfully deleted invite ${inviteCode}`;
    } catch (error) {
      throw new Error(
        `Failed to delete invite: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async getInvites(this: DiscordService, guildId?: string): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    try {
      const invites = await guild.invites.fetch();

      if (invites.size === 0) {
        return "No invites found in this server";
      }

      const formattedInvites = invites.map((invite: Invite) => {
        const channel = invite.channel;
        const inviter = invite.inviter;
        const expiresAt = invite.expiresAt
          ? invite.expiresAt.toLocaleString()
          : "Never";
        const maxUses = invite.maxUses || "Unlimited";
        const uses = invite.uses || 0;

        return `- **${invite.code}** (${invite.url})
    - Channel: ${channel?.name || "Unknown"}
    - Created by: ${inviter?.username || "Unknown"}
    - Uses: ${uses}/${maxUses}
    - Expires: ${expiresAt}
    - Temporary: ${invite.temporary ? "Yes" : "No"}`;
      });

      return `**Found ${invites.size} invites:**\n${formattedInvites.join("\n\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to fetch invites: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export type InvitesMethods = typeof invitesMethods;
