import { GuildMember, Role, Collection } from "discord.js";

import type { DiscordService } from "./service.js";

export const membersMethods = {
  async getMembers(
    this: DiscordService,
    guildId?: string,
    limit?: number,
    after?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    try {
      const fetchOptions: any = { limit: limit || 100 };
      if (after) {
        fetchOptions.after = after;
      }

      const memberResult = await guild.members.fetch(fetchOptions);

      // Handle both single member and collection results
      const memberCollection =
        memberResult instanceof Collection
          ? memberResult
          : new Collection<string, GuildMember>([
              [memberResult.id, memberResult],
            ]);

      const formattedMembers = Array.from(memberCollection.values()).map(
        (member: GuildMember) => {
          const joinedAt = member.joinedAt?.toLocaleDateString() || "Unknown";
          const roles =
            member.roles.cache
              .filter((role: Role) => role.name !== "@everyone")
              .map((role: Role) => role.name)
              .join(", ") || "None";

          return `- **${member.user.username}** (${member.user.id})
    - Nickname: ${member.nickname || "None"}
    - Joined: ${joinedAt}
    - Roles: ${roles}
    - Status: ${member.presence?.status || "Unknown"}`;
        },
      );

      return `**Retrieved ${memberCollection.size} members from ${guild.name}:**\n${formattedMembers.join("\n\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to fetch members: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async searchMembers(
    this: DiscordService,
    guildId?: string,
    query?: string,
    limit?: number,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!query) {
      throw new Error("Search query is required");
    }

    try {
      // Search by username/nickname
      const results = await guild.members.search({
        query: query,
        limit: limit || 10,
      });

      if (results.size === 0) {
        return `No members found matching query "${query}"`;
      }

      const formattedResults = Array.from(results.values()).map(
        (member: GuildMember) => {
          const joinedAt = member.joinedAt?.toLocaleDateString() || "Unknown";
          return `- **${member.user.username}** (${member.user.id})
    - Nickname: ${member.nickname || "None"}
    - Joined: ${joinedAt}`;
        },
      );

      return `**Found ${results.size} members matching "${query}":**\n${formattedResults.join("\n\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to search members: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async editMember(
    this: DiscordService,
    guildId?: string,
    userId?: string,
    nickname?: string,
    roles?: string[],
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const member = await guild.members.fetch(userId);
      if (!member) {
        throw new Error("Member not found in this server");
      }

      const changes: string[] = [];

      // Update nickname
      if (nickname !== undefined) {
        await member.setNickname(nickname);
        changes.push(`nickname to "${nickname || "None"}"`);
      }

      // Update roles
      if (roles !== undefined && roles.length > 0) {
        const roleObjects = roles.map((roleId) => {
          const role = guild.roles.cache.get(roleId);
          if (!role) {
            throw new Error(`Role not found: ${roleId}`);
          }
          return role;
        });

        await member.roles.set(roleObjects);
        changes.push(`roles to: ${roleObjects.map((r) => r.name).join(", ")}`);
      }

      if (changes.length === 0) {
        return "No changes specified for member edit";
      }

      return `Successfully edited member ${member.user.username}. Changed: ${changes.join(", ")}`;
    } catch (error) {
      throw new Error(
        `Failed to edit member: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async getMemberInfo(
    this: DiscordService,
    guildId?: string,
    userId?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const member = await guild.members.fetch(userId);
      if (!member) {
        throw new Error("Member not found in this server");
      }

      const user = member.user;
      const joinedAt = member.joinedAt?.toLocaleString() || "Unknown";
      const createdAt = user.createdAt.toLocaleString();
      const roles =
        member.roles.cache
          .filter((role) => role.name !== "@everyone")
          .map((role) => `${role.name} (${role.id})`)
          .join("\n  - ") || "None";

      const permissions = member.permissions.toArray().join(", ") || "None";

      return `**Member Information for ${user.username}:**
  - **User ID:** ${user.id}
  - **Nickname:** ${member.nickname || "None"}
  - **Account Created:** ${createdAt}
  - **Joined Server:** ${joinedAt}
  - **Highest Role:** ${member.roles.highest.name}
  - **Avatar:** ${user.displayAvatarURL()}
  - **Bot:** ${user.bot ? "Yes" : "No"}
  - **Roles:**
    - ${roles}
  - **Key Permissions:** ${permissions.substring(0, 500)}${permissions.length > 500 ? "..." : ""}`;
    } catch (error) {
      throw new Error(
        `Failed to get member info: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export type MembersMethods = typeof membersMethods;
