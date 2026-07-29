import type { ZodTypeAny } from "zod";
import type { DiscordService } from "../../discord-service.js";
import { automodDescriptors } from "./descriptors/automod.js";
import { channelDescriptors } from "./descriptors/channels.js";
import { emojiDescriptors } from "./descriptors/emojis.js";
import { eventDescriptors } from "./descriptors/events.js";
import { fileDescriptors } from "./descriptors/files.js";
import { interactionDescriptors } from "./descriptors/interactions.js";
import { inviteDescriptors } from "./descriptors/invites.js";
import { memberDescriptors } from "./descriptors/members.js";
import { messageDescriptors } from "./descriptors/messages.js";
import { privateMessageDescriptors } from "./descriptors/private-messages.js";
import { roleDescriptors } from "./descriptors/roles.js";
import { serverDescriptors } from "./descriptors/server.js";
import { stickerDescriptors } from "./descriptors/stickers.js";
import { voiceDescriptors } from "./descriptors/voice.js";
import { webhookDescriptors } from "./descriptors/webhooks.js";

export type ToolDescriptor = {
  name: string;
  schema: ZodTypeAny;
  keys?: string[];
  method?: string;
  buildArgs?: (parsed: any) => any[];
};

export type ToolHandler = (args: unknown) => Promise<string>;

const ALL_DESCRIPTORS: ToolDescriptor[] = [
  ...serverDescriptors,
  ...messageDescriptors,
  ...privateMessageDescriptors,
  ...channelDescriptors,
  ...webhookDescriptors,
  ...voiceDescriptors,
  ...roleDescriptors,
  ...memberDescriptors,
  ...eventDescriptors,
  ...inviteDescriptors,
  ...emojiDescriptors,
  ...stickerDescriptors,
  ...fileDescriptors,
  ...automodDescriptors,
  ...interactionDescriptors,
];

const toCamel = (name: string) =>
  name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const buildHandler = (
  descriptor: ToolDescriptor,
  discordService: DiscordService,
): ToolHandler => {
  const methodName = descriptor.method || toCamel(descriptor.name);
  const method = (discordService as any)[methodName];
  if (typeof method !== "function") {
    throw new Error(`DiscordService method not found: ${methodName}`);
  }

  return async (args: unknown) => {
    const parsed = descriptor.schema.parse(args);
    const params = descriptor.buildArgs
      ? descriptor.buildArgs(parsed)
      : descriptor.keys
        ? descriptor.keys.map((key) => (parsed as any)[key])
        : Object.values(parsed);
    return await method.apply(discordService, params);
  };
};

export const createToolHandlers = (
  discordService: DiscordService,
): Map<string, ToolHandler> => {
  const handlers = new Map<string, ToolHandler>();

  for (const descriptor of ALL_DESCRIPTORS) {
    if (handlers.has(descriptor.name)) {
      throw new Error(`Duplicate tool descriptor: ${descriptor.name}`);
    }
    handlers.set(descriptor.name, buildHandler(descriptor, discordService));
  }

  return handlers;
};
