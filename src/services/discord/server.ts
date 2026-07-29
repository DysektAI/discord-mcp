import {
  ChannelType,
  PermissionFlagsBits,
  GuildVerificationLevel,
} from "discord.js";

import type { DiscordService } from "./service.js";

export const serverMethods = {
  async getServerInfo(this: DiscordService, guildId?: string): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      const owner = await guild.fetchOwner();
      
      return `Server Name: ${guild.name}
  Server ID: ${guild.id}
  Owner: ${owner.user.username}
  Created On: ${guild.createdAt.toLocaleDateString()}
  Members: ${guild.memberCount}
  Channels:
   - Text: ${guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size}
   - Voice: ${guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size}
    - Categories: ${guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size}
  Boosts:
   - Count: ${guild.premiumSubscriptionCount || 0}
   - Tier: ${guild.premiumTier}`;
    },

  async editServer(this: DiscordService, 
      guildId?: string, 
      name?: string, 
      description?: string, 
      icon?: string, 
      banner?: string, 
      verificationLevel?: string
    ): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      // Check permissions
      if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
        throw new Error("Bot requires 'Manage Server' permission to edit server settings");
      }
  
      try {
        const editOptions: any = {};
        const changes: string[] = [];
  
        if (name && name !== guild.name) {
          editOptions.name = name;
          changes.push(`Name: "${guild.name}" ΓåÆ "${name}"`);
        }
  
        if (description !== undefined && description !== guild.description) {
          editOptions.description = description;
          changes.push(`Description: "${guild.description || 'None'}" ΓåÆ "${description || 'None'}"`);
        }
  
        if (icon) {
          editOptions.icon = icon;
          changes.push(`Icon updated`);
        }
  
        if (banner) {
          editOptions.banner = banner;
          changes.push(`Banner updated`);
        }
  
        if (verificationLevel) {
          let level: GuildVerificationLevel;
          switch (verificationLevel.toUpperCase()) {
            case 'NONE':
              level = GuildVerificationLevel.None;
              break;
            case 'LOW':
              level = GuildVerificationLevel.Low;
              break;
            case 'MEDIUM':
              level = GuildVerificationLevel.Medium;
              break;
            case 'HIGH':
              level = GuildVerificationLevel.High;
              break;
            case 'VERY_HIGH':
              level = GuildVerificationLevel.VeryHigh;
              break;
            default:
              throw new Error(`Invalid verification level: ${verificationLevel}`);
          }
          
          if (level !== guild.verificationLevel) {
            editOptions.verificationLevel = level;
            changes.push(`Verification level: ${guild.verificationLevel} ΓåÆ ${level}`);
          }
        }
  
        if (changes.length === 0) {
          return "No changes specified for the server";
        }
  
        const updatedGuild = await guild.edit(editOptions);
  
        return `Successfully edited server "${updatedGuild.name}" (ID: ${updatedGuild.id})
  Changes made:
  ${changes.map(change => `- ${change}`).join('\n')}`;
      } catch (error) {
        throw new Error(`Failed to edit server: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async getServerWidget(this: DiscordService, guildId?: string): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      try {
        const widget = await guild.fetchWidget().catch(() => null);
        
        if (!widget) {
          return `**Server Widget for ${guild.name}**
  Widget is disabled or not available. Enable it in Server Settings > Widget to use this feature.`;
        }
  
        const channels = Array.from(widget.channels.values()).map(channel => 
          `- **${channel.name}** (${channel.id})`
        );
  
        return `**Server Widget for ${guild.name}**
  - **Invite URL**: ${widget.instantInvite || 'None'}
  - **Online Members**: ${widget.presenceCount}
  - **Voice Channels**: ${widget.channels.size}
  
  **Channels with activity:**
  ${channels.length > 0 ? channels.join('\n') : 'No active channels'}`;
      } catch (error) {
        throw new Error(`Failed to get server widget: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async getWelcomeScreen(this: DiscordService, guildId?: string): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      try {
        const welcomeScreen = await guild.fetchWelcomeScreen().catch(() => null);
        
        if (!welcomeScreen) {
          return `**Welcome Screen for ${guild.name}**
  Welcome screen is not enabled or not available. Enable it in Server Settings > Overview > Welcome Screen.`;
        }
  
        const channels = Array.from(welcomeScreen.welcomeChannels.values()).map(channel => {
          const emoji = channel.emoji ? (typeof channel.emoji === 'string' ? channel.emoji : channel.emoji.name) : '';
          return `- ${emoji ? emoji + ' ' : ''}**${channel.description}**
    Channel: <#${channel.channelId}> (${channel.channelId})`;
        });
  
        return `**Welcome Screen for ${guild.name}**
  - **Enabled**: Yes
  - **Description**: ${welcomeScreen.description || 'No description'}
  - **Welcome Channels**: ${welcomeScreen.welcomeChannels.size}
  
  **Channels:**
  ${channels.length > 0 ? channels.join('\n\n') : 'No welcome channels configured'}`;
      } catch (error) {
        throw new Error(`Failed to get welcome screen: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async editWelcomeScreen(this: DiscordService, 
      guildId?: string, 
      enabled?: boolean, 
      description?: string, 
      welcomeChannels?: any[]
    ): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      // Check permissions
      if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
        throw new Error("Bot requires 'Manage Server' permission to edit welcome screen");
      }
  
      try {
        const editOptions: any = {};
        const changes: string[] = [];
  
        if (enabled !== undefined) {
          editOptions.enabled = enabled;
          changes.push(`Enabled: ${enabled ? 'Yes' : 'No'}`);
        }
  
        if (description !== undefined) {
          editOptions.description = description;
          changes.push(`Description updated`);
        }
  
        if (welcomeChannels) {
          const formattedChannels = welcomeChannels.map(channelData => {
            if (!channelData.channelId || !channelData.description) {
              throw new Error("Each welcome channel requires channelId and description");
            }
  
            const welcomeChannel: any = {
              channelId: channelData.channelId,
              description: channelData.description
            };
  
            if (channelData.emoji) {
              welcomeChannel.emoji = channelData.emoji;
            }
  
            return welcomeChannel;
          });
  
          editOptions.welcomeChannels = formattedChannels;
          changes.push(`Welcome channels updated (${formattedChannels.length} channels)`);
        }
  
        if (changes.length === 0) {
          return "No changes specified for the welcome screen";
        }
  
        await guild.editWelcomeScreen(editOptions);
  
        return `Successfully edited welcome screen for "${guild.name}" (ID: ${guild.id})
  Changes made:
  ${changes.map(change => `- ${change}`).join('\n')}`;
      } catch (error) {
        throw new Error(`Failed to edit welcome screen: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async getServerStats(this: DiscordService, guildId?: string): Promise<string> {
      this.ensureReady();
      const resolvedGuildId = this.resolveGuildId(guildId);
      
      const guild = this.client.guilds.cache.get(resolvedGuildId);
      if (!guild) {
        throw new Error("Discord server not found by guildId");
      }
  
      try {
        const channels = guild.channels.cache;
        const roles = guild.roles.cache;
        const emojis = guild.emojis.cache;
  
        const channelStats = {
          text: channels.filter(c => c.type === ChannelType.GuildText).size,
          voice: channels.filter(c => c.type === ChannelType.GuildVoice).size,
          category: channels.filter(c => c.type === ChannelType.GuildCategory).size,
          stage: channels.filter(c => c.type === ChannelType.GuildStageVoice).size,
          announcement: channels.filter(c => c.type === ChannelType.GuildAnnouncement).size,
          forum: channels.filter(c => c.type === ChannelType.GuildForum).size
        };
  
        const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Very High'];
        const createdDate = guild.createdAt.toLocaleDateString();
        const ownerTag = guild.members.cache.get(guild.ownerId)?.user.tag || 'Unknown';
  
        return `**Server Statistics for ${guild.name}**
  
  **Basic Info:**
  - Server ID: ${guild.id}
  - Owner: ${ownerTag}
  - Created: ${createdDate}
  - Verification Level: ${verificationLevels[guild.verificationLevel]}
  - Boost Level: ${guild.premiumTier}
  - Boost Count: ${guild.premiumSubscriptionCount || 0}
  
  **Members:**
  - Total Members: ${guild.memberCount}
  - Max Members: ${guild.maximumMembers || 'Unlimited'}
  
  **Channels (${channels.size} total):**
  - Text: ${channelStats.text}
  - Voice: ${channelStats.voice}
  - Categories: ${channelStats.category}
  - Stage: ${channelStats.stage}
  - Announcement: ${channelStats.announcement}
  - Forum: ${channelStats.forum}
  
  **Roles:** ${roles.size - 1} (excluding @everyone)
  **Custom Emojis:** ${emojis.size}
  **Features:** ${guild.features.length > 0 ? guild.features.join(', ') : 'None'}`;
      } catch (error) {
        throw new Error(`Failed to get server stats: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
};

export type ServerMethods = typeof serverMethods;
