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

export const channelEditMethods = {
  async editChannelAdvanced(this: DiscordService, guildId: string | undefined, channelId: string, options: {
        name?: string,
        topic?: string,
        slowmode?: number,
        userLimit?: number,
        bitrate?: number,
        isPrivate?: boolean,
        allowedRoles?: string[],
        categoryId?: string | null
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
    
          const editOptions: any = {};
          const changes: string[] = [];
    
          // Basic properties
          if (options.name !== undefined) {
            if (options.name.length === 0 || options.name.length > 100) {
              throw new Error("Channel name must be between 1 and 100 characters");
            }
            editOptions.name = options.name;
            changes.push(`name to "${options.name}"`);
          }
    
          if (options.topic !== undefined) {
            if (options.topic.length > 1024) {
              throw new Error("Channel topic cannot exceed 1024 characters");
            }
            editOptions.topic = options.topic;
            changes.push(`topic to "${options.topic}"`);
          }
    
          // Rate limiting (slowmode)
          if (options.slowmode !== undefined) {
            if (options.slowmode < 0 || options.slowmode > 21600) {
              throw new Error("Slowmode must be between 0 and 21600 seconds (6 hours)");
            }
            editOptions.rateLimitPerUser = options.slowmode;
            changes.push(`slowmode to ${options.slowmode}s`);
          }
    
          // Voice-specific options
          if (options.userLimit !== undefined) {
            if (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice) {
              throw new Error("User limit can only be set on voice and stage channels");
            }
            if (options.userLimit < 0 || options.userLimit > 99) {
              throw new Error("User limit must be between 0 and 99 (0 = unlimited)");
            }
            editOptions.userLimit = options.userLimit;
            changes.push(`user limit to ${options.userLimit === 0 ? 'unlimited' : options.userLimit}`);
          }
    
          if (options.bitrate !== undefined) {
            if (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice) {
              throw new Error("Bitrate can only be set on voice and stage channels");
            }
            const maxBitrate = guild.maximumBitrate || 64000;
            if (options.bitrate < 8000 || options.bitrate > maxBitrate) {
              throw new Error(`Bitrate must be between 8000 and ${maxBitrate} (server's maximum based on boost level)`);
            }
            editOptions.bitrate = options.bitrate;
            changes.push(`bitrate to ${options.bitrate}kbps`);
          }
    
          // Category change
          if (options.categoryId !== undefined) {
            if (options.categoryId === null) {
              editOptions.parent = null;
              changes.push("removed from category");
            } else {
              const category = guild.channels.cache.get(options.categoryId);
              if (!category || category.type !== ChannelType.GuildCategory) {
                throw new Error("Category not found by categoryId");
              }
              editOptions.parent = category;
              changes.push(`moved to category "${category.name}"`);
            }
          }
    
          // Apply basic edits
          if (Object.keys(editOptions).length > 0) {
            await channel.edit(editOptions);
          }
    
          // Handle privacy settings separately
          if (options.isPrivate !== undefined || options.allowedRoles !== undefined) {
            await this.configureChannelPrivacy(channel, options.isPrivate, options.allowedRoles, guild);
            if (options.isPrivate) changes.push("made private");
            if (options.allowedRoles?.length) changes.push(`granted access to ${options.allowedRoles.length} role(s)`);
          }
    
          if (changes.length === 0) {
            return "No changes specified for channel edit";
          }
    
          return `Successfully edited channel "${channel.name}" (ID: ${channelId}). Changed: ${changes.join(', ')}`;
        } catch (error) {
          throw new Error(`Failed to edit channel: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
};

export type ChannelEditMethods = typeof channelEditMethods;
