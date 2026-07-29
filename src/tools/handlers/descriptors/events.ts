import * as schemas from "../../../types.js";
import type { ToolDescriptor } from "../registry.js";

export const eventDescriptors: ToolDescriptor[] = [
  {
    name: "create_event",
    schema: schemas.CreateEventSchema,
    keys: [
      "guildId",
      "name",
      "description",
      "scheduledStartTime",
      "scheduledEndTime",
      "entityType",
      "privacyLevel",
      "channelId",
      "location",
      "image",
    ],
  },
  {
    name: "edit_event",
    schema: schemas.EditEventSchema,
    keys: [
      "guildId",
      "eventId",
      "name",
      "description",
      "scheduledStartTime",
      "scheduledEndTime",
      "entityType",
      "privacyLevel",
      "channelId",
      "location",
      "image",
    ],
  },
  {
    name: "delete_event",
    schema: schemas.DeleteEventSchema,
    keys: ["guildId", "eventId"],
  },
  {
    name: "get_events",
    schema: schemas.GetEventsSchema,
    keys: ["guildId"],
  },
];
