import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const voiceDescriptors: ToolDescriptor[] = [
  {
    name: "join_voice_channel",
    schema: schemas.JoinVoiceChannelSchema,
    keys: ["guildId", "channelId"],
  },
  {
    name: "leave_voice_channel",
    schema: schemas.LeaveVoiceChannelSchema,
    keys: ["guildId", "channelId"],
  },
  {
    name: "play_audio",
    schema: schemas.PlayAudioSchema,
    keys: ["guildId", "audioUrl"],
  },
  {
    name: "stop_audio",
    schema: schemas.StopAudioSchema,
    keys: ["guildId"],
  },
  {
    name: "set_volume",
    schema: schemas.SetVolumeSchema,
    keys: ["guildId", "volume"],
  },
  {
    name: "get_voice_connections",
    schema: schemas.GetVoiceConnectionsSchema,
    keys: [],
  },
];
