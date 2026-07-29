import { z } from "zod";

export const JoinVoiceChannelSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  channelId: z.string().describe("Voice channel ID"),
});

export const LeaveVoiceChannelSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
});

export const PlayAudioSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  audioUrl: z.string().describe("URL or path to audio file"),
});

export const StopAudioSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
});

export const SetVolumeSchema = z.object({
  guildId: z.string().describe("Discord server ID"),
  volume: z.number().min(0).max(200).describe("Volume level (0-200)"),
});

export const GetVoiceConnectionsSchema = z.object({});
