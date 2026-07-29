import {
  Client,
  GatewayIntentBits,
  TextChannel,
  ChannelType,
  Message,
  PermissionFlagsBits,
  Collection,
} from "discord.js";
import { VoiceConnection, AudioPlayer } from "@discordjs/voice";
import type { AutomodMethods } from "./automod.js";
import type { ChannelsMethods } from "./channels.js";
import type { EmojisMethods } from "./emojis.js";
import type { EventsMethods } from "./events.js";
import type { FilesMethods } from "./files.js";
import type { InteractionsMethods } from "./interactions.js";
import type { InvitesMethods } from "./invites.js";
import type { MembersMethods } from "./members.js";
import type { MessagesMethods } from "./messages.js";
import type { PrivateMessagesMethods } from "./privateMessages.js";
import type { RolesMethods } from "./roles.js";
import type { ServerMethods } from "./server.js";
import type { StickersMethods } from "./stickers.js";
import type { VoiceMethods } from "./voice.js";
import type { WebhooksMethods } from "./webhooks.js";
import { automodMethods } from "./automod.js";
import { channelsMethods } from "./channels.js";
import { emojisMethods } from "./emojis.js";
import { eventsMethods } from "./events.js";
import { filesMethods } from "./files.js";
import { interactionsMethods } from "./interactions.js";
import { invitesMethods } from "./invites.js";
import { membersMethods } from "./members.js";
import { messagesMethods } from "./messages.js";
import { privateMessagesMethods } from "./privateMessages.js";
import { rolesMethods } from "./roles.js";
import { serverMethods } from "./server.js";
import { stickersMethods } from "./stickers.js";
import { voiceMethods } from "./voice.js";
import { webhooksMethods } from "./webhooks.js";
import { sanitizeForLog } from "../../core/LogSanitizer.js";

export class DiscordService {
  public client: Client;
  public defaultGuildId?: string;
  public isReady: boolean = false;
  public audioPlayers: Map<string, AudioPlayer> = new Map();
  public voiceConnections: Map<string, VoiceConnection> = new Map();

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration,
      ],
    });

    this.defaultGuildId = process.env.DISCORD_GUILD_ID;
  }

  async initialize(): Promise<void> {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      console.error(
        "ERROR: The environment variable DISCORD_TOKEN is not set. Please set it to run the application properly.",
      );
      process.exit(1);
    }

    return new Promise((resolve, reject) => {
      const handleReady = () => {
        console.error(`Discord bot logged in as ${this.client.user?.tag}`);
        this.isReady = true;
        resolve();
      };

      // Use the new event name to avoid deprecation warnings.
      this.client.once("clientReady", handleReady);

      this.client.on("error", (error) => {
        console.error(`Discord client error: ${sanitizeForLog(error)}`);
      });

      this.client.login(token).catch(reject);
    });
  }

  resolveGuildId(guildId?: string): string {
    const resolved = guildId || this.defaultGuildId;
    if (!resolved) {
      throw new Error("guildId cannot be null");
    }
    return resolved;
  }

  ensureReady(): void {
    if (!this.isReady) {
      throw new Error("Discord client is not ready");
    }
  }

  normalizePositiveInt(value: unknown, fallback: number): number {
    if (value === undefined || value === null) {
      return fallback;
    }

    const parsed =
      typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    const floored = Math.floor(parsed);
    return floored > 0 ? floored : fallback;
  }

  clampMessageFetchLimit(value: unknown, fallback: number): number {
    return Math.min(this.normalizePositiveInt(value, fallback), 100);
  }

  async fetchMessagesInBatches(
    channel: TextChannel,
    totalLimit: number,
  ): Promise<Message[]> {
    const collected: Message[] = [];
    let remaining = totalLimit;
    let beforeId: string | undefined;

    while (remaining > 0) {
      const batchLimit = Math.min(remaining, 100);
      const fetchOptions: any = { limit: batchLimit };

      if (beforeId) {
        fetchOptions.before = beforeId;
      }

      const batch = (await channel.messages.fetch(
        fetchOptions,
      )) as unknown as Collection<string, Message>;
      if (batch.size === 0) {
        break;
      }

      const batchMessages = Array.from(batch.values());
      collected.push(...batchMessages);
      remaining -= batchMessages.length;

      beforeId = batchMessages[batchMessages.length - 1].id;
      if (batchMessages.length < batchLimit) {
        break;
      }
    }

    return collected;
  }

  formatMessages(messages: Message[]): string[] {
    return messages.map((m) => {
      const authorName = m.author.username;
      const timestamp = m.createdAt.toISOString();
      const contentText = m.content || "";
      const attachments = Array.from(m.attachments.values());
      const attachmentSummary =
        attachments.length > 0
          ? attachments
              .slice(0, 3)
              .map((att) => `${att.name || "file"} (${att.url})`)
              .join("; ")
          : "";
      const attachmentSuffix =
        attachments.length > 0
          ? `Attachments (${attachments.length}): ${attachmentSummary}${
              attachments.length > 3 ? "; ..." : ""
            }`
          : "";
      const content = contentText
        ? attachmentSuffix
          ? `${contentText}\n${attachmentSuffix}`
          : contentText
        : attachmentSuffix || "[No content]";
      const messageId = m.id;

      return `- (ID: ${messageId}) **[${authorName}]** \`${timestamp}\`: \`\`\`${content}\`\`\``;
    });
  }

  async configureChannelPrivacy(
    channel: any,
    isPrivate?: boolean,
    allowedRoles?: string[],
    guild?: any,
  ): Promise<void> {
    if (!guild) {
      throw new Error("Guild is required for privacy settings");
    }

    try {
      const permissionOverwrites = [];

      if (isPrivate) {
        // If private, deny @everyone access first
        permissionOverwrites.push({
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
          type: 0, // Role type
        });
      } else {
        // If public, allow @everyone access
        permissionOverwrites.push({
          id: guild.id,
          allow: [PermissionFlagsBits.ViewChannel],
          type: 0,
        });
      }

      if (allowedRoles?.length) {
        for (const roleId of allowedRoles) {
          const role = guild.roles.cache.get(roleId);
          if (!role) {
            throw new Error(`Role not found: ${roleId}`);
          }

          permissionOverwrites.push({
            id: roleId,
            allow: [PermissionFlagsBits.ViewChannel],
            type: 0, // Role type
          });
        }
      }

      // Apply permission overwrites
      if (permissionOverwrites.length > 0) {
        await channel.permissionOverwrites.set(permissionOverwrites);
      }
    } catch (error) {
      throw new Error(
        `Failed to configure channel privacy: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  getChannelEmoji(channelType: ChannelType): string {
    switch (channelType) {
      case ChannelType.GuildText:
        return "💬";
      case ChannelType.GuildVoice:
        return "🔊";
      case ChannelType.GuildCategory:
        return "📁";
      case ChannelType.GuildForum:
        return "📋";
      case ChannelType.GuildAnnouncement:
        return "📢";
      case ChannelType.GuildStageVoice:
        return "🎤";
      case ChannelType.GuildDirectory:
        return "📂";
      case ChannelType.GuildMedia:
        return "🖼️";
      case ChannelType.GuildNews:
        return "📰";
      case ChannelType.GuildPublicThread:
      case ChannelType.GuildPrivateThread:
      case ChannelType.GuildNewsThread:
        return "🧵";
      default:
        return "📌";
    }
  }

  async destroy(): Promise<void> {
    // Clean up voice connections
    for (const [guildId, connection] of this.voiceConnections) {
      connection.destroy();
    }
    this.voiceConnections.clear();

    // Clean up audio players
    for (const [guildId, player] of this.audioPlayers) {
      player.stop();
    }
    this.audioPlayers.clear();

    await this.client.destroy();
  }
}

export interface DiscordService
  extends
    ServerMethods,
    MessagesMethods,
    PrivateMessagesMethods,
    ChannelsMethods,
    WebhooksMethods,
    VoiceMethods,
    RolesMethods,
    MembersMethods,
    EventsMethods,
    InvitesMethods,
    EmojisMethods,
    StickersMethods,
    FilesMethods,
    AutomodMethods,
    InteractionsMethods {}

Object.assign(
  DiscordService.prototype,
  serverMethods,
  messagesMethods,
  privateMessagesMethods,
  channelsMethods,
  webhooksMethods,
  voiceMethods,
  rolesMethods,
  membersMethods,
  eventsMethods,
  invitesMethods,
  emojisMethods,
  stickersMethods,
  filesMethods,
  automodMethods,
  interactionsMethods,
);
