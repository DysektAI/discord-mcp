import { VoiceChannel, StageChannel, ChannelType } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
} from "@discordjs/voice";

import type { DiscordService } from "./service.js";

export const voiceMethods = {
  async joinVoiceChannel(
    this: DiscordService,
    guildId: string,
    channelId: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    const channel = guild.channels.cache.get(channelId);
    if (
      !channel ||
      (channel.type !== ChannelType.GuildVoice &&
        channel.type !== ChannelType.GuildStageVoice)
    ) {
      throw new Error("Voice channel not found by channelId");
    }

    const voiceChannel = channel as VoiceChannel | StageChannel;

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });

      // Store connection
      this.voiceConnections.set(guild.id, connection);

      // Create audio player for this guild if it doesn't exist
      if (!this.audioPlayers.has(guild.id)) {
        const player = createAudioPlayer();
        this.audioPlayers.set(guild.id, player);
        connection.subscribe(player);
      }

      return `Successfully joined voice channel: ${voiceChannel.name} in ${guild.name}`;
    } catch (error) {
      throw new Error(
        `Failed to join voice channel: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async leaveVoiceChannel(
    this: DiscordService,
    guildId: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const connection = getVoiceConnection(resolvedGuildId);
    if (!connection) {
      throw new Error("No active voice connection in this server");
    }

    try {
      connection.destroy();
      this.voiceConnections.delete(resolvedGuildId);

      // Clean up audio player
      const player = this.audioPlayers.get(resolvedGuildId);
      if (player) {
        player.stop();
        this.audioPlayers.delete(resolvedGuildId);
      }

      return "Successfully left voice channel";
    } catch (error) {
      throw new Error(
        `Failed to leave voice channel: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async playAudio(
    this: DiscordService,
    guildId: string,
    audioUrl: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const connection = this.voiceConnections.get(resolvedGuildId);
    if (!connection) {
      throw new Error("Bot is not connected to a voice channel in this server");
    }

    const player = this.audioPlayers.get(resolvedGuildId);
    if (!player) {
      throw new Error("Audio player not initialized for this server");
    }

    try {
      // Create audio resource from URL or file path
      const resource = createAudioResource(audioUrl);

      // Play the audio
      player.play(resource);

      // Wait for the player to become idle or error
      return new Promise((resolve, reject) => {
        player.once(AudioPlayerStatus.Playing, () => {
          resolve(`Started playing audio from: ${audioUrl}`);
        });

        player.once("error", (error) => {
          reject(new Error(`Audio playback error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(
        `Failed to play audio: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async stopAudio(this: DiscordService, guildId: string): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const player = this.audioPlayers.get(resolvedGuildId);
    if (!player) {
      throw new Error("No audio player found for this server");
    }

    try {
      player.stop();
      return "Audio playback stopped";
    } catch (error) {
      throw new Error(
        `Failed to stop audio: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async setVolume(
    this: DiscordService,
    guildId: string,
    volume: number,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    // Note: Discord.js voice doesn't have built-in volume control
    // You would need to use a transformer stream or external library
    // For now, we'll return a message indicating this limitation

    const player = this.audioPlayers.get(resolvedGuildId);
    if (!player) {
      throw new Error("No audio player found for this server");
    }

    // This is a placeholder - actual volume control would require
    // additional implementation with audio transformers
    return `Volume control is not directly supported. Consider using audio processing libraries for volume adjustment. Requested volume: ${volume}%`;
  },

  async getVoiceConnections(this: DiscordService): Promise<string> {
    this.ensureReady();

    if (this.voiceConnections.size === 0) {
      return "No active voice connections";
    }

    const connections: string[] = [];
    for (const [guildId, connection] of this.voiceConnections) {
      const guild = this.client.guilds.cache.get(guildId);
      if (guild) {
        const channelId = connection.joinConfig.channelId;
        const channel = guild.channels.cache.get(channelId || "");
        const channelName = channel ? channel.name : "Unknown Channel";
        const status = connection.state.status;
        connections.push(`- ${guild.name}: ${channelName} (Status: ${status})`);
      }
    }

    return `Active voice connections:\n${connections.join("\n")}`;
  },
};

export type VoiceMethods = typeof voiceMethods;
