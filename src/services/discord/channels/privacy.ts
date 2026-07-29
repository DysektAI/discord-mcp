import {
  Client,
  GatewayIntentBits,
  GuildMember,
  TextChannel,
  VoiceChannel,
  StageChannel,
  CategoryChannel,
  GuildChannel,
  ThreadChannel,
  ChannelType,
  ThreadAutoArchiveDuration,
  Message,
  AttachmentBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  OverwriteType,
  AuditLogEvent,
  GuildBan,
  Role,
  ColorResolvable,
  GuildScheduledEvent,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventStatus,
  Invite,
  GuildEmoji,
  Sticker,
  GuildVerificationLevel,
  AutoModerationRuleTriggerType,
  AutoModerationRuleEventType,
  AutoModerationActionType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Collection,
  WebhookClient,
} from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
  VoiceConnection,
  AudioPlayer,
} from "@discordjs/voice";


import type { DiscordService } from "../service.js";

export const channelPrivacyMethods = {
  async setChannelPrivate(this: DiscordService, guildId: string | undefined, channelId: string, options: {
        isPrivate: boolean,
        allowedRoles?: string[],
        allowedMembers?: string[],
        syncToCategory?: boolean
      }): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Discord server not found by guildId");
        }
    
        // Check bot permissions
        const botMember = guild.members.cache.get(this.client.user!.id);
        if (!botMember?.permissions.has(PermissionFlagsBits.ManageChannels)) {
          throw new Error("Bot doesn't have permission to manage channels");
        }
    
        try {
          const channel = guild.channels.cache.get(channelId);
          if (!channel) {
            throw new Error(`Channel not found: ${channelId}`);
          }
    
          const permissionOverwrites = [];
          const changes: string[] = [];
    
          if (options.isPrivate) {
            // Make private: deny @everyone access
            permissionOverwrites.push({
              id: guild.id, // @everyone role
              deny: [PermissionFlagsBits.ViewChannel],
              type: 0 // Role type
            });
            changes.push("made private (denied @everyone access)");
          } else {
            // Make public: allow @everyone access
            permissionOverwrites.push({
              id: guild.id, // @everyone role
              allow: [PermissionFlagsBits.ViewChannel],
              type: 0 // Role type
            });
            changes.push("made public (granted @everyone access)");
          }
    
          // Grant access to specific roles
          if (options.allowedRoles?.length) {
            for (const roleId of options.allowedRoles) {
              const role = guild.roles.cache.get(roleId);
              if (!role) {
                throw new Error(`Role not found: ${roleId}`);
              }
              
              const permissions = [PermissionFlagsBits.ViewChannel];
              // Add Connect permission for voice channels
              if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
                permissions.push(PermissionFlagsBits.Connect);
              }
              
              permissionOverwrites.push({
                id: roleId,
                allow: permissions,
                type: 0 // Role type
              });
            }
            changes.push(`granted access to ${options.allowedRoles.length} role(s)`);
          }
    
          // Grant access to specific members
          if (options.allowedMembers?.length) {
            for (const memberId of options.allowedMembers) {
              const member = guild.members.cache.get(memberId);
              if (!member) {
                throw new Error(`Member not found: ${memberId}`);
              }
              
              const permissions = [PermissionFlagsBits.ViewChannel];
              // Add Connect permission for voice channels
              if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
                permissions.push(PermissionFlagsBits.Connect);
              }
              
              permissionOverwrites.push({
                id: memberId,
                allow: permissions,
                type: 1 // Member type
              });
            }
            changes.push(`granted access to ${options.allowedMembers.length} member(s)`);
          }
    
          // Apply permission overwrites
          await (channel as any).permissionOverwrites.set(permissionOverwrites);
    
          // Optionally sync to category
          if (options.syncToCategory && channel.parent) {
            try {
              await (channel as any).lockPermissions();
              changes.push("synced permissions with category");
            } catch (error) {
              // Don't fail the whole operation if sync fails
              changes.push("(failed to sync with category)");
            }
          }
    
          return `Successfully updated privacy for channel "${channel.name}" (ID: ${channelId}). Changes: ${changes.join(', ')}`;
        } catch (error) {
          throw new Error(`Failed to set channel privacy: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

  async setCategoryPrivate(this: DiscordService, guildId: string | undefined, categoryId: string, options: {
        isPrivate: boolean,
        allowedRoles?: string[],
        allowedMembers?: string[],
        applyToChannels?: boolean
      }): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Discord server not found by guildId");
        }
    
        // Check bot permissions
        const botMember = guild.members.cache.get(this.client.user!.id);
        if (!botMember?.permissions.has(PermissionFlagsBits.ManageChannels)) {
          throw new Error("Bot doesn't have permission to manage channels");
        }
    
        try {
          const category = guild.channels.cache.get(categoryId);
          if (!category || category.type !== ChannelType.GuildCategory) {
            throw new Error(`Category not found or not a category: ${categoryId}`);
          }
    
          const permissionOverwrites = [];
          const changes: string[] = [];
    
          if (options.isPrivate) {
            // Make private: deny @everyone access
            permissionOverwrites.push({
              id: guild.id, // @everyone role
              deny: [PermissionFlagsBits.ViewChannel],
              type: 0 // Role type
            });
            changes.push("made private (denied @everyone access)");
          } else {
            // Make public: allow @everyone access
            permissionOverwrites.push({
              id: guild.id, // @everyone role
              allow: [PermissionFlagsBits.ViewChannel],
              type: 0 // Role type
            });
            changes.push("made public (granted @everyone access)");
          }
    
          // Grant access to specific roles
          if (options.allowedRoles?.length) {
            for (const roleId of options.allowedRoles) {
              const role = guild.roles.cache.get(roleId);
              if (!role) {
                throw new Error(`Role not found: ${roleId}`);
              }
              
              permissionOverwrites.push({
                id: roleId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                type: 0 // Role type
              });
            }
            changes.push(`granted access to ${options.allowedRoles.length} role(s)`);
          }
    
          // Grant access to specific members
          if (options.allowedMembers?.length) {
            for (const memberId of options.allowedMembers) {
              const member = guild.members.cache.get(memberId);
              if (!member) {
                throw new Error(`Member not found: ${memberId}`);
              }
              
              permissionOverwrites.push({
                id: memberId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                type: 1 // Member type
              });
            }
            changes.push(`granted access to ${options.allowedMembers.length} member(s)`);
          }
    
          // Apply permission overwrites to category
          await category.permissionOverwrites.set(permissionOverwrites);
    
          // Optionally apply to all channels in category
          if (options.applyToChannels) {
            const channelsInCategory = guild.channels.cache.filter(ch => ch.parentId === categoryId);
            let syncedChannels = 0;
            
            for (const [, channel] of channelsInCategory) {
              try {
                await (channel as any).lockPermissions();
                syncedChannels++;
              } catch (error) {
                // Continue with other channels if one fails
              }
            }
            
            if (syncedChannels > 0) {
              changes.push(`applied to ${syncedChannels} channel(s) in category`);
            }
          }
    
          return `Successfully updated privacy for category "${category.name}" (ID: ${categoryId}). Changes: ${changes.join(', ')}`;
        } catch (error) {
          throw new Error(`Failed to set category privacy: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

  async bulkSetPrivacy(this: DiscordService, guildId: string | undefined, targets: Array<{
        id: string,
        type: 'channel' | 'category',
        isPrivate: boolean,
        allowedRoles?: string[],
        allowedMembers?: string[]
      }>): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Discord server not found by guildId");
        }
    
        // Check bot permissions
        const botMember = guild.members.cache.get(this.client.user!.id);
        if (!botMember?.permissions.has(PermissionFlagsBits.ManageChannels)) {
          throw new Error("Bot doesn't have permission to manage channels");
        }
    
        try {
          const results: string[] = [];
          let successCount = 0;
          let failureCount = 0;
    
          for (const target of targets) {
            try {
              if (target.type === 'channel') {
                await this.setChannelPrivate(guildId, target.id, {
                  isPrivate: target.isPrivate,
                  allowedRoles: target.allowedRoles,
                  allowedMembers: target.allowedMembers
                });
              } else if (target.type === 'category') {
                await this.setCategoryPrivate(guildId, target.id, {
                  isPrivate: target.isPrivate,
                  allowedRoles: target.allowedRoles,
                  allowedMembers: target.allowedMembers
                });
              }
              successCount++;
            } catch (error) {
              failureCount++;
              results.push(`Failed ${target.type} ${target.id}: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
    
          const summary = [`Successfully updated ${successCount} target(s)`];
          if (failureCount > 0) {
            summary.push(`${failureCount} failed`);
          }
    
          if (results.length > 0) {
            summary.push(`Errors: ${results.join('; ')}`);
          }
    
          return summary.join('. ');
        } catch (error) {
          throw new Error(`Failed bulk privacy update: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
};

export type ChannelPrivacyMethods = typeof channelPrivacyMethods;
