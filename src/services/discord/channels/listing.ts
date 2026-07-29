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

const getGuildOrThrow = async (
  service: DiscordService,
  guildId: string,
) => {
  const cached = service.client.guilds.cache.get(guildId);
  if (cached) {
    return cached;
  }
  try {
    return await service.client.guilds.fetch(guildId);
  } catch {
    throw new Error("Discord server not found by guildId");
  }
};

export const channelListingMethods = {
  async deleteChannel(this: DiscordService, guildId: string | undefined, channelId: string): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = await getGuildOrThrow(this, resolvedGuildId);
    
        const channel = guild.channels.cache.get(channelId);
        if (!channel) {
          throw new Error("Channel not found by channelId");
        }
    
        const channelType = ChannelType[channel.type];
        const channelName = channel.name;
        
        await channel.delete();
        return `Deleted ${channelType} channel: ${channelName}`;
      },

  async findChannel(this: DiscordService, guildId: string | undefined, channelName: string): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = await getGuildOrThrow(this, resolvedGuildId);
    
        const channels = guild.channels.cache.filter(c => 
          c.name.toLowerCase() === channelName.toLowerCase()
        );
    
        if (channels.size === 0) {
          throw new Error(`No channels found with name ${channelName}`);
        }
    
        if (channels.size > 1) {
          const channelList = channels.map(c => 
            `- ${ChannelType[c.type]} channel: ${c.name} (ID: ${c.id})`
          ).join('\n');
          return `Retrieved ${channels.size} channels:\n${channelList}`;
        }
    
        const channel = channels.first()!;
        return `Retrieved ${ChannelType[channel.type]} channel: ${channel.name} (ID: ${channel.id})`;
      },

  async listChannels(this: DiscordService, guildId?: string): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = await getGuildOrThrow(this, resolvedGuildId);
    
        const channels = guild.channels.cache;
        if (channels.size === 0) {
          throw new Error("No channels found by guildId");
        }
    
        const channelList = channels.map(c => 
          `- ${ChannelType[c.type]} channel: ${c.name} (ID: ${c.id})`
        ).join('\n');
        
        return `Retrieved ${channels.size} channels:\n${channelList}`;
      },

  async organizeChannels(this: DiscordService, guildId: string | undefined, organization: {
        categories?: Array<{categoryId: string, position: number}>,
        channels?: Array<{channelId: string, position?: number, categoryId?: string | null}>
      }): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = await getGuildOrThrow(this, resolvedGuildId);
    
        // Check bot permissions
        const botMember = guild.members.cache.get(this.client.user!.id);
        if (!botMember?.permissions.has(PermissionFlagsBits.ManageChannels)) {
          throw new Error("Bot doesn't have permission to manage channels");
        }
    
        try {
          const results: string[] = [];
    
          // First, organize categories
          if (organization.categories && organization.categories.length > 0) {
            const categoryChanges: Array<{channel: any, position: number}> = [];
            
            for (const { categoryId, position } of organization.categories) {
              const category = guild.channels.cache.get(categoryId);
              if (!category || category.type !== ChannelType.GuildCategory) {
                throw new Error(`Category with ID ${categoryId} not found or not a category`);
              }
              categoryChanges.push({ channel: category, position });
            }
    
            if (categoryChanges.length > 0) {
              await guild.channels.setPositions(categoryChanges);
              results.push(`Repositioned ${categoryChanges.length} categories`);
            }
          }
    
          // Then, organize channels (move to categories and set positions)
          if (organization.channels && organization.channels.length > 0) {
            let movedToCategories = 0;
            let repositioned = 0;
    
            for (const { channelId, position, categoryId } of organization.channels) {
              const channel = guild.channels.cache.get(channelId);
              if (!channel) {
                throw new Error(`Channel with ID ${channelId} not found`);
              }
    
              const editableChannel = channel as any;
    
              // Move to category if specified
              if (categoryId !== undefined) {
                if (categoryId && !guild.channels.cache.get(categoryId)) {
                  throw new Error(`Category with ID ${categoryId} not found`);
                }
                
                if (typeof editableChannel.setParent === 'function') {
                  await editableChannel.setParent(categoryId);
                  movedToCategories++;
                }
              }
    
              // Set position if specified
              if (position !== undefined) {
                if (typeof editableChannel.setPosition === 'function') {
                  await editableChannel.setPosition(position);
                  repositioned++;
                }
              }
            }
    
            if (movedToCategories > 0) {
              results.push(`Moved ${movedToCategories} channels to new categories`);
            }
            if (repositioned > 0) {
              results.push(`Repositioned ${repositioned} channels`);
            }
          }
    
          return `Successfully organized server: ${results.join(', ')}`;
        } catch (error) {
          throw new Error(`Failed to organize channels: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

  async getChannelStructure(this: DiscordService, guildId: string | undefined): Promise<string> {
        this.ensureReady();
        const resolvedGuildId = this.resolveGuildId(guildId);
        
        const guild = await getGuildOrThrow(this, resolvedGuildId);
    
        try {
          const channels = guild.channels.cache
            .filter(channel => {
              // Only include channels that have a position property
              const channelWithPosition = channel as any;
              return channelWithPosition.position !== undefined;
            })
            .sort((a, b) => {
              const aPos = (a as any).position || 0;
              const bPos = (b as any).position || 0;
              return aPos - bPos;
            });
    
          const structure: string[] = [];
          const categories = new Map();
          const orphanChannels: any[] = [];
    
          // Group channels by category
          channels.forEach(channel => {
            if (channel.type === ChannelType.GuildCategory) {
              categories.set(channel.id, {
                category: channel,
                channels: []
              });
            } else if (channel.parent) {
              if (!categories.has(channel.parent.id)) {
                categories.set(channel.parent.id, {
                  category: channel.parent,
                  channels: []
                });
              }
              categories.get(channel.parent.id).channels.push(channel);
            } else {
              orphanChannels.push(channel);
            }
          });
    
          // Build structure string
          structure.push(`≡ƒôï **Channel Structure for ${guild.name}**\n`);
    
          // Show orphan channels first (channels not in any category)
          if (orphanChannels.length > 0) {
            structure.push("≡ƒö╕ **Uncategorized Channels:**");
            orphanChannels.forEach(channel => {
              const emoji = this.getChannelEmoji(channel.type);
              const position = (channel as any).position || 0;
              structure.push(`  ${emoji} ${channel.name} (ID: ${channel.id}, Position: ${position})`);
            });
            structure.push("");
          }
    
          // Show categories and their channels
          const sortedCategories = Array.from(categories.values())
            .sort((a, b) => {
              const aPos = (a.category as any).position || 0;
              const bPos = (b.category as any).position || 0;
              return aPos - bPos;
            });
    
          sortedCategories.forEach(({ category, channels: categoryChannels }) => {
            const categoryPosition = (category as any).position || 0;
            structure.push(`≡ƒôü **${category.name}** (ID: ${category.id}, Position: ${categoryPosition})`);
            
            const sortedChannels = categoryChannels.sort((a: any, b: any) => {
              const aPos = a.position || 0;
              const bPos = b.position || 0;
              return aPos - bPos;
            });
            sortedChannels.forEach((channel: any) => {
              const emoji = this.getChannelEmoji(channel.type);
              const position = channel.position || 0;
              structure.push(`  ${emoji} ${channel.name} (ID: ${channel.id}, Position: ${position})`);
            });
            structure.push("");
          });
    
          return structure.join('\n');
        } catch (error) {
          throw new Error(`Failed to get channel structure: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
};

export type ChannelListingMethods = typeof channelListingMethods;
