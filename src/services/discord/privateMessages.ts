import type { DiscordService } from "./service.js";

export const privateMessagesMethods = {
  async getUserIdByName(
    this: DiscordService,
    username: string,
    guildId?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    let name = username;
    let discriminator: string | null = null;

    if (username.includes("#")) {
      const idx = username.lastIndexOf("#");
      name = username.substring(0, idx);
      discriminator = username.substring(idx + 1);
    }

    // Fetch all members if not cached
    await guild.members.fetch();

    let members = guild.members.cache.filter(
      (m) => m.user.username.toLowerCase() === name.toLowerCase(),
    );

    if (discriminator) {
      members = members.filter((m) => m.user.discriminator === discriminator);
    }

    if (members.size === 0) {
      throw new Error(`No user found with username ${username}`);
    }

    if (members.size > 1) {
      const userList = members
        .map(
          (m) =>
            `${m.user.username}#${m.user.discriminator} (ID: ${m.user.id})`,
        )
        .join(", ");
      throw new Error(
        `Multiple users found with username '${username}'. List: ${userList}. Please specify the full username#discriminator.`,
      );
    }

    return members.first()!.user.id;
  },

  async sendPrivateMessage(
    this: DiscordService,
    userId: string,
    message: string,
  ): Promise<string> {
    this.ensureReady();

    const user = await this.client.users.fetch(userId);
    if (!user) {
      throw new Error("User not found by userId");
    }

    const dmChannel = await user.createDM();
    const sentMessage = await dmChannel.send(message);

    return `Message sent successfully. Message link: ${sentMessage.url}`;
  },

  async editPrivateMessage(
    this: DiscordService,
    userId: string,
    messageId: string,
    newMessage: string,
  ): Promise<string> {
    this.ensureReady();

    const user = await this.client.users.fetch(userId);
    if (!user) {
      throw new Error("User not found by userId");
    }

    const dmChannel = await user.createDM();
    const message = await dmChannel.messages.fetch(messageId);
    if (!message) {
      throw new Error("Message not found by messageId");
    }

    const editedMessage = await message.edit(newMessage);
    return `Message edited successfully. Message link: ${editedMessage.url}`;
  },

  async deletePrivateMessage(
    this: DiscordService,
    userId: string,
    messageId: string,
  ): Promise<string> {
    this.ensureReady();

    const user = await this.client.users.fetch(userId);
    if (!user) {
      throw new Error("User not found by userId");
    }

    const dmChannel = await user.createDM();
    const message = await dmChannel.messages.fetch(messageId);
    if (!message) {
      throw new Error("Message not found by messageId");
    }

    await message.delete();
    return "Message deleted successfully";
  },

  async readPrivateMessages(
    this: DiscordService,
    userId: string,
    count?: string,
  ): Promise<string> {
    this.ensureReady();

    const limit = count ? parseInt(count) : 100;

    const user = await this.client.users.fetch(userId);
    if (!user) {
      throw new Error("User not found by userId");
    }

    const dmChannel = await user.createDM();
    const messages = await dmChannel.messages.fetch({ limit });
    const formattedMessages = this.formatMessages(
      Array.from(messages.values()),
    );

    return `**Retrieved ${messages.size} messages:** \n${formattedMessages.join("\n")}`;
  },
};

export type PrivateMessagesMethods = typeof privateMessagesMethods;
