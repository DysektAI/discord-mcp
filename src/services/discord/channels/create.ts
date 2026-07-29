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

export const channelCreateMethods = {
  async createTextChannel(this: DiscordService, guildId: string | undefined, name: string, categoryId?: string): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Discord server not found by guildId");
        }
    
        let textChannel;
        if (categoryId) {
          const category = guild.channels.cache.get(categoryId) as CategoryChannel;
          if (!category || category.type !== ChannelType.GuildCategory) {
            throw new Error("Category not found by categoryId");
          }
          textChannel = await guild.channels.create({
            name,
            type: ChannelType.GuildText,
            parent: category
          });
          return `Created new text channel: ${textChannel.name} (ID: ${textChannel.id}) in category: ${category.name}`;
        } else {
          textChannel = await guild.channels.create({
            name,
            type: ChannelType.GuildText
          });
          return `Created new text channel: ${textChannel.name} (ID: ${textChannel.id})`;
        }
      },

  async createVoiceChannel(this: DiscordService, guildId: string | undefined, name: string, categoryId?: string, userLimit?: number, bitrate?: number): Promise<string> {
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
          // Validate user limit (0-99, where 0 means unlimited)
          let validUserLimit = userLimit;
          if (userLimit !== undefined) {
            if (userLimit < 0 || userLimit > 99) {
              throw new Error("User limit must be between 0 and 99 (0 = unlimited)");
            }
            validUserLimit = userLimit;
          }
    
          // Validate bitrate (8000-384000 depending on server boost level)
          let validBitrate = bitrate;
          if (bitrate !== undefined) {
            // Get server's maximum bitrate based on boost level
            const maxBitrate = guild.maximumBitrate || 64000; // Default to 64kbps if not available
            
            if (bitrate < 8000 || bitrate > maxBitrate) {
              throw new Error(`Bitrate must be between 8000 and ${maxBitrate} (server's maximum based on boost level)`);
            }
            validBitrate = bitrate;
          }
    
          let voiceChannel;
          const channelOptions: any = {
            name,
            type: ChannelType.GuildVoice
          };
    
          // Add optional properties if provided
          if (validUserLimit !== undefined) {
            channelOptions.userLimit = validUserLimit;
          }
          if (validBitrate !== undefined) {
            channelOptions.bitrate = validBitrate;
          }
    
          if (categoryId) {
            const category = guild.channels.cache.get(categoryId) as CategoryChannel;
            if (!category || category.type !== ChannelType.GuildCategory) {
              throw new Error("Category not found by categoryId");
            }
            channelOptions.parent = category;
            
            voiceChannel = await guild.channels.create(channelOptions);
            
            const details = [];
            if (validUserLimit !== undefined) details.push(`user limit: ${validUserLimit === 0 ? 'unlimited' : validUserLimit}`);
            if (validBitrate !== undefined) details.push(`bitrate: ${validBitrate}kbps`);
            
            return `Created new voice channel: ${voiceChannel.name} (ID: ${voiceChannel.id}) in category: ${category.name}${details.length > 0 ? ` with ${details.join(', ')}` : ''}`;
          } else {
            voiceChannel = await guild.channels.create(channelOptions);
            
            const details = [];
            if (validUserLimit !== undefined) details.push(`user limit: ${validUserLimit === 0 ? 'unlimited' : validUserLimit}`);
            if (validBitrate !== undefined) details.push(`bitrate: ${validBitrate}kbps`);
            
            return `Created new voice channel: ${voiceChannel.name} (ID: ${voiceChannel.id})${details.length > 0 ? ` with ${details.join(', ')}` : ''}`;
          }
        } catch (error) {
          throw new Error(`Failed to create voice channel: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

  async createForumChannel(this: DiscordService, guildId: string | undefined, name: string, categoryId?: string, options?: {
        topic?: string,
        slowmode?: number,
        defaultReactionEmoji?: string,
        isPrivate?: boolean,
        allowedRoles?: string[]
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
          const channelOptions: any = {
            name,
            type: ChannelType.GuildForum
          };
    
          // Add optional properties
          if (options?.topic) {
            channelOptions.topic = options.topic;
          }
          if (options?.slowmode && options.slowmode > 0) {
            if (options.slowmode > 21600) { // Max 6 hours
              throw new Error("Slowmode cannot exceed 21600 seconds (6 hours)");
            }
            channelOptions.rateLimitPerUser = options.slowmode;
          }
          if (options?.defaultReactionEmoji) {
            channelOptions.defaultReactionEmoji = options.defaultReactionEmoji;
          }
    
          // Handle category
          if (categoryId) {
            const category = guild.channels.cache.get(categoryId) as CategoryChannel;
            if (!category || category.type !== ChannelType.GuildCategory) {
              throw new Error("Category not found by categoryId");
            }
            channelOptions.parent = category;
          }
    
          const forumChannel = await guild.channels.create(channelOptions);
    
          // Set privacy and role permissions if specified
          if (options?.isPrivate || options?.allowedRoles) {
            await this.configureChannelPrivacy(forumChannel, options.isPrivate, options.allowedRoles, guild);
          }
    
          const details = [];
          if (options?.topic) details.push(`topic: "${options.topic}"`);
          if (options?.slowmode) details.push(`slowmode: ${options.slowmode}s`);
          if (options?.isPrivate) details.push("private channel");
          if (options?.allowedRoles?.length) details.push(`${options.allowedRoles.length} role(s) granted access`);
    
          return `Created forum channel: ${forumChannel.name} (ID: ${forumChannel.id})${categoryId ? ` in category` : ''}${details.length > 0 ? ` with ${details.join(', ')}` : ''}`;
        } catch (error) {
          throw new Error(`Failed to create forum channel: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

  async createAnnouncementChannel(this: DiscordService, guildId: string | undefined, name: string, categoryId?: string, options?: {
        topic?: string,
        slowmode?: number,
        isPrivate?: boolean,
        allowedRoles?: string[]
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
          const channelOptions: any = {
            name,
            type: ChannelType.GuildAnnouncement
          };
    
          // Add optional properties
          if (options?.topic) {
            channelOptions.topic = options.topic;
          }
          if (options?.slowmode && options.slowmode > 0) {
            if (options.slowmode > 21600) {
              throw new Error("Slowmode cannot exceed 21600 seconds (6 hours)");
            }
            channelOptions.rateLimitPerUser = options.slowmode;
          }
    
          // Handle category
          if (categoryId) {
            const category = guild.channels.cache.get(categoryId) as CategoryChannel;
            if (!category || category.type !== ChannelType.GuildCategory) {
              throw new Error("Category not found by categoryId");
            }
            channelOptions.parent = category;
          }
    
          const announcementChannel = await guild.channels.create(channelOptions);
    
          // Set privacy and role permissions if specified
          if (options?.isPrivate || options?.allowedRoles) {
            await this.configureChannelPrivacy(announcementChannel, options.isPrivate, options.allowedRoles, guild);
          }
    
          const details = [];
          if (options?.topic) details.push(`topic: "${options.topic}"`);
          if (options?.slowmode) details.push(`slowmode: ${options.slowmode}s`);
          if (options?.isPrivate) details.push("private channel");
          if (options?.allowedRoles?.length) details.push(`${options.allowedRoles.length} role(s) granted access`);
    
          return `Created announcement channel: ${announcementChannel.name} (ID: ${announcementChannel.id})${categoryId ? ` in category` : ''}${details.length > 0 ? ` with ${details.join(', ')}` : ''}`;
        } catch (error) {
          throw new Error(`Failed to create announcement channel: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

  async createStageChannel(this: DiscordService, guildId: string | undefined, name: string, categoryId?: string, options?: {
        topic?: string,
        bitrate?: number,
        isPrivate?: boolean,
        allowedRoles?: string[]
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
          const channelOptions: any = {
            name,
            type: ChannelType.GuildStageVoice
          };
    
          // Add optional properties
          if (options?.topic) {
            channelOptions.topic = options.topic;
          }
          if (options?.bitrate) {
            const maxBitrate = guild.maximumBitrate || 64000;
            if (options.bitrate < 8000 || options.bitrate > maxBitrate) {
              throw new Error(`Bitrate must be between 8000 and ${maxBitrate} (server's maximum based on boost level)`);
            }
            channelOptions.bitrate = options.bitrate;
          }
    
          // Handle category
          if (categoryId) {
            const category = guild.channels.cache.get(categoryId) as CategoryChannel;
            if (!category || category.type !== ChannelType.GuildCategory) {
              throw new Error("Category not found by categoryId");
            }
            channelOptions.parent = category;
          }
    
          const stageChannel = await guild.channels.create(channelOptions);
    
          // Set privacy and role permissions if specified
          if (options?.isPrivate || options?.allowedRoles) {
            await this.configureChannelPrivacy(stageChannel, options.isPrivate, options.allowedRoles, guild);
          }
    
          const details = [];
          if (options?.topic) details.push(`topic: "${options.topic}"`);
          if (options?.bitrate) details.push(`bitrate: ${options.bitrate}kbps`);
          if (options?.isPrivate) details.push("private channel");
          if (options?.allowedRoles?.length) details.push(`${options.allowedRoles.length} role(s) granted access`);
    
          return `Created stage channel: ${stageChannel.name} (ID: ${stageChannel.id})${categoryId ? ` in category` : ''}${details.length > 0 ? ` with ${details.join(', ')}` : ''}`;
        } catch (error) {
          throw new Error(`Failed to create stage channel: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
};

export type ChannelCreateMethods = typeof channelCreateMethods;
