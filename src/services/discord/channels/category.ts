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

export const channelCategoryMethods = {
  async createCategory(this: DiscordService, guildId: string | undefined, name: string): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Discord server not found by guildId");
        }
    
        const category = await guild.channels.create({
          name,
          type: ChannelType.GuildCategory
        });
        
        return `Created new category: ${category.name}`;
      },

  async deleteCategory(this: DiscordService, guildId: string | undefined, categoryId: string): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Discord server not found by guildId");
        }
    
        const category = guild.channels.cache.get(categoryId) as CategoryChannel;
        if (!category || category.type !== ChannelType.GuildCategory) {
          throw new Error("Category not found by categoryId");
        }
    
        const categoryName = category.name;
        await category.delete();
        
        return `Deleted category: ${categoryName}`;
      },

  async findCategory(this: DiscordService, guildId: string | undefined, categoryName: string): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Discord server not found by guildId");
        }
    
        const categories = guild.channels.cache.filter(c => 
          c.type === ChannelType.GuildCategory && 
          c.name.toLowerCase() === categoryName.toLowerCase()
        );
    
        if (categories.size === 0) {
          throw new Error(`Category ${categoryName} not found`);
        }
    
        if (categories.size > 1) {
          const categoryList = categories.map(c => 
            `**${c.name}** - \`${c.id}\``
          ).join(', ');
          throw new Error(`Multiple channels found with name ${categoryName}.\nList: ${categoryList}.\nPlease specify the channel ID.`);
        }
    
        const category = categories.first()!;
        return `Retrieved category: ${category.name}, with ID: ${category.id}`;
      },

  async listChannelsInCategory(this: DiscordService, guildId: string | undefined, categoryId: string): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Discord server not found by guildId");
        }
    
        const category = guild.channels.cache.get(categoryId) as CategoryChannel;
        if (!category || category.type !== ChannelType.GuildCategory) {
          throw new Error("Category not found by categoryId");
        }
    
        const channels = category.children.cache;
        if (channels.size === 0) {
          throw new Error("Category not contains any channels");
        }
    
        const channelList = channels.map(c => 
          `- ${ChannelType[c.type]} channel: ${c.name} (ID: ${c.id})`
        ).join('\n');
        
        return `Retrieved ${channels.size} channels:\n${channelList}`;
      },

  async setCategoryPosition(this: DiscordService, guildId: string | undefined, categoryId: string, position: number): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Guild not found");
        }
    
        // Check bot permissions
        const botMember = guild.members.cache.get(this.client.user!.id);
        if (!botMember?.permissions.has(PermissionFlagsBits.ManageChannels)) {
          throw new Error("Bot doesn't have permission to manage channels");
        }
    
        try {
          const category = guild.channels.cache.get(categoryId);
          if (!category || category.type !== ChannelType.GuildCategory) {
            throw new Error("Category not found or not a category channel");
          }
    
          await category.setPosition(position);
          
          return `Successfully moved category "${category.name}" to position ${position}`;
        } catch (error) {
          throw new Error(`Failed to set category position: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

  async moveChannelToCategory(this: DiscordService, guildId: string | undefined, channelId: string, categoryId: string | null): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Guild not found");
        }
    
        // Check bot permissions
        const botMember = guild.members.cache.get(this.client.user!.id);
        if (!botMember?.permissions.has(PermissionFlagsBits.ManageChannels)) {
          throw new Error("Bot doesn't have permission to manage channels");
        }
    
        try {
          const channel = guild.channels.cache.get(channelId);
          if (!channel) {
            throw new Error("Channel not found in this guild");
          }
    
          let category = null;
          if (categoryId) {
            category = guild.channels.cache.get(categoryId);
            if (!category || category.type !== ChannelType.GuildCategory) {
              throw new Error("Category not found or invalid category type");
            }
          }
    
          const editableChannel = channel as any;
          if (typeof editableChannel.setParent !== 'function') {
            throw new Error("Channel type does not support category assignment");
          }
    
          await editableChannel.setParent(categoryId);
          
          const action = categoryId ? `moved to category "${category?.name}"` : "removed from category";
          return `Successfully ${action} channel "${channel.name}"`;
        } catch (error) {
          throw new Error(`Failed to move channel to category: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

  async setChannelPosition(this: DiscordService, guildId: string | undefined, channelId: string, position: number): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Guild not found");
        }
    
        // Check bot permissions
        const botMember = guild.members.cache.get(this.client.user!.id);
        if (!botMember?.permissions.has(PermissionFlagsBits.ManageChannels)) {
          throw new Error("Bot doesn't have permission to manage channels");
        }
    
        try {
          const channel = guild.channels.cache.get(channelId);
          if (!channel) {
            throw new Error("Channel not found in this guild");
          }
    
          // Cast to a channel type that supports setPosition
          const editableChannel = channel as any;
          if (typeof editableChannel.setPosition !== 'function') {
            throw new Error("Channel type does not support position changes");
          }
    
          await editableChannel.setPosition(position);
          
          return `Successfully moved channel "${channel.name}" to position ${position}`;
        } catch (error) {
          throw new Error(`Failed to set channel position: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

  async setChannelPositions(this: DiscordService, guildId: string | undefined, channelPositions: Array<{channelId: string, position: number}>): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = this.client.guilds.cache.get(resolvedGuildId);
        if (!guild) {
          throw new Error("Guild not found");
        }
    
        // Check bot permissions
        const botMember = guild.members.cache.get(this.client.user!.id);
        if (!botMember?.permissions.has(PermissionFlagsBits.ManageChannels)) {
          throw new Error("Bot doesn't have permission to manage channels");
        }
    
        try {
          const positionChanges: Array<{channel: any, position: number}> = [];
          
          // Validate all channels and positions
          for (const { channelId, position } of channelPositions) {
            const channel = guild.channels.cache.get(channelId);
            if (!channel) {
              throw new Error(`Channel with ID ${channelId} not found in this guild`);
            }
            
            positionChanges.push({ channel, position });
          }
    
          // Apply position changes
          await guild.channels.setPositions(positionChanges);
          
          const changedChannels = positionChanges.map(({ channel, position }) => 
            `${channel.name} to position ${position}`
          ).join(', ');
    
          return `Successfully updated channel positions: ${changedChannels}`;
        } catch (error) {
          throw new Error(`Failed to set channel positions: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
};

export type ChannelCategoryMethods = typeof channelCategoryMethods;
