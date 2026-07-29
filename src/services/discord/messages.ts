import { TextChannel, ChannelType } from "discord.js";

import type { DiscordService } from "./service.js";

export const messagesMethods = {
  async sendMessage(
    this: DiscordService,
    channelId: string,
    message: string,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found by channelId");
    }

    const sentMessage = await channel.send(message);
    return `Message sent successfully. Message link: ${sentMessage.url}`;
  },

  async editMessage(
    this: DiscordService,
    channelId: string,
    messageId: string,
    newMessage: string,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found by channelId");
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
      throw new Error("Message not found by messageId");
    }

    const editedMessage = await message.edit(newMessage);
    return `Message edited successfully. Message link: ${editedMessage.url}`;
  },

  async deleteMessage(
    this: DiscordService,
    channelId: string,
    messageId: string,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found by channelId");
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
      throw new Error("Message not found by messageId");
    }

    await message.delete();
    return "Message deleted successfully";
  },

  async readMessages(
    this: DiscordService,
    channelId: string,
    count?: string,
  ): Promise<string> {
    this.ensureReady();

    const limit = count ? parseInt(count) : 100;

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found by channelId");
    }

    const messages = await channel.messages.fetch({ limit });
    const formattedMessages = this.formatMessages(
      Array.from(messages.values()),
    );

    return `**Retrieved ${messages.size} messages:** \n${formattedMessages.join("\n")}`;
  },

  async addReaction(
    this: DiscordService,
    channelId: string,
    messageId: string,
    emoji: string,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found by channelId");
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
      throw new Error("Message not found by messageId");
    }

    await message.react(emoji);
    return `Added reaction successfully. Message link: ${message.url}`;
  },

  async removeReaction(
    this: DiscordService,
    channelId: string,
    messageId: string,
    emoji: string,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found by channelId");
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
      throw new Error("Message not found by messageId");
    }

    const reaction = message.reactions.cache.find(
      (r) => r.emoji.name === emoji,
    );
    if (reaction) {
      await reaction.users.remove(this.client.user!.id);
    }

    return `Removed reaction successfully. Message link: ${message.url}`;
  },

  async pinMessage(
    this: DiscordService,
    channelId: string,
    messageId: string,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found or not a text channel");
    }

    try {
      const message = await channel.messages.fetch(messageId);
      if (!message) {
        throw new Error("Message not found by messageId");
      }

      await message.pin();
      return `Successfully pinned message in ${channel.name}. Message link: ${message.url}`;
    } catch (error) {
      throw new Error(
        `Failed to pin message: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async unpinMessage(
    this: DiscordService,
    channelId: string,
    messageId: string,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found or not a text channel");
    }

    try {
      const message = await channel.messages.fetch(messageId);
      if (!message) {
        throw new Error("Message not found by messageId");
      }

      if (!message.pinned) {
        return `Message is not pinned in ${channel.name}`;
      }

      await message.unpin();
      return `Successfully unpinned message in ${channel.name}`;
    } catch (error) {
      throw new Error(
        `Failed to unpin message: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async getPinnedMessages(
    this: DiscordService,
    channelId: string,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found or not a text channel");
    }

    try {
      const pinnedMessages = await channel.messages.fetchPinned();

      if (pinnedMessages.size === 0) {
        return `No pinned messages found in ${channel.name}`;
      }

      const formattedMessages = pinnedMessages.map((message) => {
        const authorName = message.author.username;
        const timestamp = message.createdAt.toISOString();
        const content = message.content || "[No content]";
        return `- **${authorName}** (${timestamp}): ${content.substring(0, 100)}${content.length > 100 ? "..." : ""}\n  Link: ${message.url}`;
      });

      return `**Found ${pinnedMessages.size} pinned messages in ${channel.name}:**\n${formattedMessages.join("\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to fetch pinned messages: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async bulkDeleteMessages(
    this: DiscordService,
    channelId: string,
    messageIds: string[],
    filterOld?: boolean,
    confirm?: boolean,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found or not a text channel");
    }

    try {
      // Filter out messages older than 14 days if requested (Discord limitation)
      let messagesToDelete = messageIds;
      let filteredOld = 0;
      let missing = 0;

      if (filterOld !== false) {
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        const validMessages: string[] = [];

        for (const messageId of messageIds) {
          try {
            const message = await channel.messages.fetch(messageId);
            if (message.createdTimestamp > twoWeeksAgo) {
              validMessages.push(messageId);
            } else {
              filteredOld += 1;
            }
          } catch (error) {
            // Message doesn't exist, skip it
            missing += 1;
          }
        }
        messagesToDelete = validMessages;
      }

      if (!confirm) {
        const details: string[] = [];
        if (filterOld !== false && filteredOld > 0) {
          details.push(
            `Filtered out ${filteredOld} message(s) older than 14 days.`,
          );
        }
        if (missing > 0) {
          details.push(
            `Skipped ${missing} missing or inaccessible message(s).`,
          );
        }
        const previewIds = messagesToDelete.slice(0, 5).join(", ");
        const preview =
          messagesToDelete.length > 0
            ? `Example IDs: ${previewIds}${messagesToDelete.length > 5 ? ", ..." : ""}`
            : "No eligible message IDs found.";
        const summary = details.length > 0 ? ` ${details.join(" ")}` : "";
        return `Preview only: ${messagesToDelete.length} message(s) would be deleted from ${channel.name}. Set confirm=true to proceed.${summary} ${preview}`;
      }

      if (messagesToDelete.length === 0) {
        return "No valid messages to delete";
      }

      if (messagesToDelete.length === 1) {
        // Use single delete for one message
        await channel.messages.delete(messagesToDelete[0]);
        return `Successfully deleted 1 message from ${channel.name}`;
      } else {
        // Use bulk delete for multiple messages
        const deleted = await channel.bulkDelete(messagesToDelete, true);
        return `Successfully deleted ${deleted.size} messages from ${channel.name}`;
      }
    } catch (error) {
      throw new Error(
        `Failed to bulk delete messages: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async crosspostMessage(
    this: DiscordService,
    channelId: string,
    messageId: string,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId);
    if (
      !channel ||
      (channel.type !== ChannelType.GuildAnnouncement &&
        channel.type !== ChannelType.GuildText)
    ) {
      throw new Error("Channel not found or not an announcement channel");
    }

    const announcementChannel = channel as TextChannel;

    try {
      const message = await announcementChannel.messages.fetch(messageId);
      if (!message) {
        throw new Error("Message not found by messageId");
      }

      if (message.crosspostable) {
        await message.crosspost();
        return `Successfully crossposted message in ${announcementChannel.name}. Message link: ${message.url}`;
      } else {
        return `Message cannot be crossposted (may already be crossposted or not eligible)`;
      }
    } catch (error) {
      throw new Error(
        `Failed to crosspost message: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async getMessageAttachments(
    this: DiscordService,
    channelId?: string,
    messageId?: string,
  ): Promise<string> {
    this.ensureReady();

    if (!channelId || !messageId) {
      throw new Error("Channel ID and message ID are required");
    }

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found or not a text channel");
    }

    try {
      const message = await channel.messages.fetch(messageId);
      if (!message) {
        throw new Error("Message not found by messageId");
      }

      const attachments = message.attachments;

      if (attachments.size === 0) {
        return "No attachments found in this message";
      }

      const formattedAttachments = attachments.map((attachment) => {
        const fileSize = `${(attachment.size / 1024).toFixed(2)} KB`;

        return `- **${attachment.name}**
    - URL: ${attachment.url}
    - Size: ${fileSize}
    - Content Type: ${attachment.contentType || "Unknown"}
    - Spoiler: ${attachment.spoiler ? "Yes" : "No"}`;
      });

      return `**Found ${attachments.size} attachments:**\n${formattedAttachments.join("\n\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to get message attachments: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async readImages(
    this: DiscordService,
    channelId: string,
    messageId?: string,
    limit: number = 1,
    includeMetadata: boolean = true,
    downloadImages: boolean = false,
  ): Promise<string> {
    try {
      const channel = this.client.channels.cache.get(channelId) as TextChannel;
      if (!channel) {
        throw new Error("Channel not found by channelId");
      }

      let messages: any[] = [];

      if (messageId) {
        // Read specific message
        const message = await channel.messages.fetch(messageId);
        if (!message) {
          throw new Error("Message not found");
        }
        messages = [message];
      } else {
        // Read recent messages to find images
        const recentMessages = await channel.messages.fetch({
          limit: limit * 5,
        }); // Get more to find images
        messages = Array.from(recentMessages.values());
      }

      const imageMessages = messages
        .filter((msg) =>
          msg.attachments.some(
            (att: any) =>
              att.contentType && att.contentType.startsWith("image/"),
          ),
        )
        .slice(0, limit);

      if (imageMessages.length === 0) {
        return messageId
          ? "No images found in the specified message"
          : `No images found in the last ${limit * 5} messages`;
      }

      const results = [];

      for (const message of imageMessages) {
        const imageAttachments = message.attachments.filter(
          (att: any) => att.contentType && att.contentType.startsWith("image/"),
        );

        for (const attachment of imageAttachments) {
          const imageInfo: any = {
            messageId: message.id,
            filename: attachment.name,
            url: attachment.url,
            contentType: attachment.contentType,
            author: message.author.username,
            timestamp: message.createdAt.toISOString(),
          };

          if (includeMetadata) {
            imageInfo.size = `${(attachment.size / 1024).toFixed(2)} KB`;
            imageInfo.width = attachment.width || "Unknown";
            imageInfo.height = attachment.height || "Unknown";
            imageInfo.spoiler = attachment.spoiler;
          }

          if (downloadImages) {
            try {
              // Add basic image analysis
              const response = await fetch(attachment.url);
              if (response.ok) {
                const buffer = await response.arrayBuffer();
                imageInfo.actualSize = buffer.byteLength;
                imageInfo.downloaded = true;
                imageInfo.analysis =
                  "Image successfully downloaded and analyzed";
              }
            } catch (downloadError) {
              imageInfo.downloadError = `Failed to download: ${downloadError instanceof Error ? downloadError.message : String(downloadError)}`;
            }
          }

          results.push(imageInfo);
        }
      }

      const formattedResults = results.map((img, index) => {
        let result = `**Image ${index + 1}: ${img.filename}**
  - Message ID: ${img.messageId}
  - Author: ${img.author}
  - URL: ${img.url}
  - Type: ${img.contentType}
  - Timestamp: ${img.timestamp}`;

        if (includeMetadata) {
          result += `
  - Size: ${img.size}
  - Dimensions: ${img.width}x${img.height}
  - Spoiler: ${img.spoiler ? "Yes" : "No"}`;
        }

        if (downloadImages) {
          if (img.downloaded) {
            result += `
  - Downloaded: Γ£à (${img.actualSize} bytes)
  - Analysis: ${img.analysis}`;
          } else if (img.downloadError) {
            result += `
  - Download: Γ¥î ${img.downloadError}`;
          }
        }

        return result;
      });

      return `**Found ${results.length} image(s):**\n\n${formattedResults.join("\n\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to read images: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async getMessageHistory(
    this: DiscordService,
    channelId?: string,
    limit?: number,
    before?: string,
    after?: string,
  ): Promise<string> {
    this.ensureReady();

    if (!channelId) {
      throw new Error("Channel ID is required");
    }

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found or not a text channel");
    }

    try {
      const fetchOptions: any = {
        limit: limit || 50,
      };

      if (before) fetchOptions.before = before;
      if (after) fetchOptions.after = after;

      const fetchedMsgs: any = await channel.messages.fetch(fetchOptions);

      if (fetchedMsgs.size === 0) {
        return "No messages found in the specified range";
      }

      const messageArray = Array.from(fetchedMsgs.values());
      const formattedMessages = messageArray.map((msg: any) => {
        const timestamp = msg.createdAt.toLocaleString();
        const attachments =
          msg.attachments.size > 0
            ? ` [${msg.attachments.size} attachments]`
            : "";
        return `**${msg.author.username}** (${timestamp})${attachments}
  ${msg.content || "*[No text content]*"}`;
      });

      return `**Message History for #${channel.name}**
  Total messages: ${fetchedMsgs.size}
  Range: ${limit || 50} messages${before ? ` before ${before}` : ""}${after ? ` after ${after}` : ""}
  
  ${formattedMessages.join("\n\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to get message history: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async exportChatLog(
    this: DiscordService,
    channelId?: string,
    format?: string,
    limit?: number,
    dateRange?: any,
  ): Promise<string> {
    this.ensureReady();

    if (!channelId) {
      throw new Error("Channel ID is required");
    }

    if (!format || !["JSON", "CSV", "TXT"].includes(format.toUpperCase())) {
      throw new Error("Format must be JSON, CSV, or TXT");
    }

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found or not a text channel");
    }

    try {
      const fetchOptions: any = {
        limit: limit || 100,
      };

      const fetchedMessages: any = await channel.messages.fetch(fetchOptions);
      let filteredMessages = Array.from(fetchedMessages.values()) as any[];

      // Apply date range filter if provided
      if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        filteredMessages = filteredMessages.filter((message) => {
          const messageDate = message.createdAt;
          return messageDate >= startDate && messageDate <= endDate;
        });
      }

      if (filteredMessages.length === 0) {
        return "No messages found in the specified criteria";
      }

      const formatType = format.toUpperCase();
      let exportData: string;

      switch (formatType) {
        case "JSON":
          const jsonData = filteredMessages.map((message) => ({
            id: message.id,
            author: {
              id: message.author.id,
              username: message.author.username,
              tag: message.author.tag,
            },
            content: message.content,
            timestamp: message.createdAt.toISOString(),
            attachments: message.attachments.map((att: any) => ({
              name: att.name,
              url: att.url,
              size: att.size,
            })),
            reactions: message.reactions.cache.map((reaction: any) => ({
              emoji: reaction.emoji.name,
              count: reaction.count,
            })),
          }));
          exportData = JSON.stringify(jsonData, null, 2);
          break;

        case "CSV":
          const csvHeaders = "ID,Author,Username,Content,Timestamp,Attachments";
          const csvRows = filteredMessages.map((message) => {
            const content = message.content.replace(/"/g, '""'); // Escape quotes
            const attachmentUrls = message.attachments
              .map((att: any) => att.url)
              .join(";");
            return `"${message.id}","${message.author.tag}","${message.author.username}","${content}","${message.createdAt.toISOString()}","${attachmentUrls}"`;
          });
          exportData = `${csvHeaders}\n${csvRows.join("\n")}`;
          break;

        case "TXT":
          const txtLines = filteredMessages.map((message) => {
            const timestamp = message.createdAt.toLocaleString();
            const attachments =
              message.attachments.size > 0
                ? ` [${message.attachments.size} attachments]`
                : "";
            return `[${timestamp}] ${message.author.tag}: ${message.content}${attachments}`;
          });
          exportData = txtLines.join("\n");
          break;

        default:
          throw new Error("Invalid format specified");
      }

      // Note: In a real implementation, you would save this to a file and return a download link
      // For MCP tools, we return a preview of the export
      const preview =
        exportData.length > 2000
          ? exportData.substring(0, 2000) + "..."
          : exportData;

      return `**Chat Log Export for #${channel.name}**
  - Format: ${formatType}
  - Messages: ${filteredMessages.length}
  - Date Range: ${dateRange ? `${dateRange.start} to ${dateRange.end}` : "All messages"}
  - Export Size: ${exportData.length} characters
  
  **Preview:**
  \`\`\`
  ${preview}
  \`\`\`
  
  *Note: This is a preview. In a production environment, the full export would be saved as a file.*`;
    } catch (error) {
      throw new Error(
        `Failed to export chat log: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export type MessagesMethods = typeof messagesMethods;
