import {
  ChannelType,
  GuildScheduledEvent,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventStatus,
} from "discord.js";

import type { DiscordService } from "./service.js";

export const eventsMethods = {
  async createEvent(
    this: DiscordService,
    guildId?: string,
    name?: string,
    description?: string,
    startTime?: string,
    endTime?: string,
    location?: string,
    channelId?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!name || !startTime) {
      throw new Error("Event name and start time are required");
    }

    try {
      const startDate = new Date(startTime);
      const endDate = endTime ? new Date(endTime) : undefined;

      // Validate dates
      if (isNaN(startDate.getTime())) {
        throw new Error(
          "Invalid start time format. Use ISO 8601 format (e.g., 2024-01-01T15:00:00Z)",
        );
      }

      if (endDate && isNaN(endDate.getTime())) {
        throw new Error("Invalid end time format. Use ISO 8601 format");
      }

      if (startDate < new Date()) {
        throw new Error("Start time cannot be in the past");
      }

      // Determine event type and entity
      let entityType = GuildScheduledEventEntityType.External;
      let channel = null;

      if (channelId) {
        channel = guild.channels.cache.get(channelId);
        if (channel) {
          if (
            channel.type === ChannelType.GuildVoice ||
            channel.type === ChannelType.GuildStageVoice
          ) {
            entityType = GuildScheduledEventEntityType.Voice;
          } else {
            throw new Error(
              "Channel must be a voice or stage channel for voice events",
            );
          }
        }
      }

      const eventOptions: any = {
        name,
        description: description || undefined,
        scheduledStartTime: startDate,
        scheduledEndTime: endDate,
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType,
      };

      if (entityType === GuildScheduledEventEntityType.Voice && channel) {
        eventOptions.channel = channel;
      } else if (entityType === GuildScheduledEventEntityType.External) {
        eventOptions.entityMetadata = {
          location: location || "External Location",
        };
      }

      const event = await guild.scheduledEvents.create(eventOptions);

      return `Successfully created event "${event.name}" (ID: ${event.id})
  - Start: ${event.scheduledStartAt?.toLocaleString()}
  - End: ${event.scheduledEndAt?.toLocaleString() || "No end time"}
  - Type: ${entityType === GuildScheduledEventEntityType.Voice ? "Voice" : "External"}
  - Location: ${entityType === GuildScheduledEventEntityType.Voice ? channel?.name : location || "External"}`;
    } catch (error) {
      throw new Error(
        `Failed to create event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async editEvent(
    this: DiscordService,
    guildId?: string,
    eventId?: string,
    name?: string,
    description?: string,
    startTime?: string,
    endTime?: string,
    location?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!eventId) {
      throw new Error("Event ID is required");
    }

    try {
      const event = await guild.scheduledEvents.fetch(eventId);
      if (!event) {
        throw new Error("Event not found by eventId");
      }

      const editOptions: any = {};
      const changes: string[] = [];

      if (name !== undefined) {
        editOptions.name = name;
        changes.push(`name to "${name}"`);
      }

      if (description !== undefined) {
        editOptions.description = description;
        changes.push(`description`);
      }

      if (startTime !== undefined) {
        const startDate = new Date(startTime);
        if (isNaN(startDate.getTime())) {
          throw new Error("Invalid start time format");
        }
        if (startDate < new Date()) {
          throw new Error("Start time cannot be in the past");
        }
        editOptions.scheduledStartTime = startDate;
        changes.push(`start time to ${startDate.toLocaleString()}`);
      }

      if (endTime !== undefined) {
        const endDate = new Date(endTime);
        if (isNaN(endDate.getTime())) {
          throw new Error("Invalid end time format");
        }
        editOptions.scheduledEndTime = endDate;
        changes.push(`end time to ${endDate.toLocaleString()}`);
      }

      if (
        location !== undefined &&
        event.entityType === GuildScheduledEventEntityType.External
      ) {
        editOptions.entityMetadata = { location };
        changes.push(`location to "${location}"`);
      }

      if (Object.keys(editOptions).length === 0) {
        return "No changes specified for event edit";
      }

      const updatedEvent = await event.edit(editOptions);

      return `Successfully edited event "${updatedEvent.name}" (ID: ${eventId}). Changed: ${changes.join(", ")}`;
    } catch (error) {
      throw new Error(
        `Failed to edit event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async deleteEvent(
    this: DiscordService,
    guildId?: string,
    eventId?: string,
  ): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    if (!eventId) {
      throw new Error("Event ID is required");
    }

    try {
      const event = await guild.scheduledEvents.fetch(eventId);
      if (!event) {
        throw new Error("Event not found by eventId");
      }

      const eventName = event.name;
      await event.delete();

      return `Successfully deleted event "${eventName}" (ID: ${eventId})`;
    } catch (error) {
      throw new Error(
        `Failed to delete event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  async getEvents(this: DiscordService, guildId?: string): Promise<string> {
    this.ensureReady();
    const resolvedGuildId = this.resolveGuildId(guildId);

    const guild = this.client.guilds.cache.get(resolvedGuildId);
    if (!guild) {
      throw new Error("Discord server not found by guildId");
    }

    try {
      const events = await guild.scheduledEvents.fetch();

      if (events.size === 0) {
        return "No scheduled events found in this server";
      }

      const formattedEvents = events.map((event: GuildScheduledEvent) => {
        const startTime = event.scheduledStartAt?.toLocaleString() || "Unknown";
        const endTime = event.scheduledEndAt?.toLocaleString() || "No end time";
        const status = GuildScheduledEventStatus[event.status];
        const entityType =
          event.entityType === GuildScheduledEventEntityType.Voice
            ? "Voice"
            : "External";
        const location =
          event.entityType === GuildScheduledEventEntityType.Voice
            ? event.channel?.name || "Unknown Channel"
            : event.entityMetadata?.location || "External Location";

        return `- **${event.name}** (ID: ${event.id})
    - Description: ${event.description || "No description"}
    - Start: ${startTime}
    - End: ${endTime}
    - Status: ${status}
    - Type: ${entityType}
    - Location: ${location}
    - Participants: ${event.userCount || 0}`;
      });

      return `**Found ${events.size} scheduled events:**\n${formattedEvents.join("\n\n")}`;
    } catch (error) {
      throw new Error(
        `Failed to fetch events: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export type EventsMethods = typeof eventsMethods;
