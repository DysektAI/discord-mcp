import { TextChannel, ChannelType, WebhookClient } from "discord.js";

import type { DiscordService } from "./service.js";

export const webhooksMethods = {
  async createWebhook(
    this: DiscordService,
    channelId: string,
    name: string,
  ): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found by channelId");
    }

    const webhook = await channel.createWebhook({
      name,
    });

    return `Created ${name} webhook: ${webhook.url}`;
  },

  async deleteWebhook(
    this: DiscordService,
    webhookId: string,
  ): Promise<string> {
    this.ensureReady();

    const webhook = await this.client.fetchWebhook(webhookId);
    if (!webhook) {
      throw new Error("Webhook not found by webhookId");
    }

    const webhookName = webhook.name;
    await webhook.delete();

    return `Deleted ${webhookName} webhook`;
  },

  async listWebhooks(this: DiscordService, channelId: string): Promise<string> {
    this.ensureReady();

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Channel not found by channelId");
    }

    const webhooks = await channel.fetchWebhooks();
    if (webhooks.size === 0) {
      throw new Error("No webhooks found");
    }

    const formattedWebhooks = webhooks.map(
      (w) => `- (ID: ${w.id}) **[${w.name}]** \`\`\`${w.url}\`\`\``,
    );

    return `**Retrieved ${formattedWebhooks.length} webhooks:** \n${formattedWebhooks.join("\n")}`;
  },

  async sendWebhookMessage(
    this: DiscordService,
    webhookUrl: string,
    message: string,
  ): Promise<string> {
    this.ensureReady();

    const webhookClient = new WebhookClient({ url: webhookUrl });
    const sentMessage = await webhookClient.send(message);

    // Webhook messages don't have a direct URL, so we return success
    return "Message sent successfully via webhook";
  },
};

export type WebhooksMethods = typeof webhooksMethods;
