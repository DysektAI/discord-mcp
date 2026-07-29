import { TextChannel, ChannelType, AttachmentBuilder } from "discord.js";

import type { DiscordService } from "./service.js";

export const filesMethods = {
  async uploadFile(
    this: DiscordService,
    channelId?: string,
    filePath?: string,
    fileName?: string,
    content?: string,
  ): Promise<string> {
    this.ensureReady();

    if (!channelId || !filePath) {
      throw new Error("Channel ID and file path are required");
    }

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found or not a text channel");
    }

    try {
      // Create attachment from file path or URL
      const attachment = new AttachmentBuilder(filePath, {
        name: fileName || undefined,
      });

      const messageOptions: any = {
        files: [attachment],
      };

      if (content) {
        messageOptions.content = content;
      }

      const message = await channel.send(messageOptions);

      const attachmentInfo = message.attachments.first();
      const fileSize = attachmentInfo
        ? `${(attachmentInfo.size / 1024).toFixed(2)} KB`
        : "Unknown size";

      return `Successfully uploaded file to ${channel.name}
  - File: ${fileName || attachmentInfo?.name || "Unknown"}
  - Size: ${fileSize}
  - Message: ${message.url}`;
    } catch (error) {
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export type FilesMethods = typeof filesMethods;
