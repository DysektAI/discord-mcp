import { z } from "zod";

export const SendModalSchema = z.object({
  interactionId: z.string().describe("Interaction ID"),
  title: z.string().describe("Modal title"),
  customId: z.string().describe("Custom ID for the modal"),
  components: z
    .array(
      z.object({
        type: z.number().describe("Component type"),
        label: z.string().describe("Component label"),
        style: z.number().optional().describe("Component style"),
        placeholder: z.string().optional().describe("Placeholder text"),
        required: z.boolean().optional().describe("Whether field is required"),
      }),
    )
    .describe("Modal components"),
});

export const SendEmbedSchema = z.object({
  channelId: z.string().describe("Channel ID"),
  title: z.string().optional().describe("Embed title"),
  description: z.string().optional().describe("Embed description"),
  color: z.string().optional().describe("Embed color (hex)"),
  fields: z
    .array(
      z.object({
        name: z.string().describe("Field name"),
        value: z.string().describe("Field value"),
        inline: z.boolean().optional().describe("Whether field is inline"),
      }),
    )
    .optional()
    .describe("Embed fields"),
  footer: z.string().optional().describe("Footer text"),
  image: z.string().optional().describe("Image URL"),
  thumbnail: z.string().optional().describe("Thumbnail URL"),
});

export const SendButtonSchema = z.object({
  channelId: z.string().describe("Channel ID"),
  content: z.string().optional().describe("Message content"),
  buttons: z
    .array(
      z.object({
        label: z.string().describe("Button label"),
        style: z
          .enum(["PRIMARY", "SECONDARY", "SUCCESS", "DANGER", "LINK"])
          .describe("Button style"),
        customId: z.string().optional().describe("Custom ID for the button"),
        url: z.string().optional().describe("URL for link buttons"),
        emoji: z.string().optional().describe("Button emoji"),
      }),
    )
    .describe("Button components"),
});

export const SendSelectMenuSchema = z.object({
  channelId: z.string().describe("Channel ID"),
  content: z.string().optional().describe("Message content"),
  customId: z.string().describe("Custom ID for the select menu"),
  placeholder: z.string().optional().describe("Placeholder text"),
  minValues: z.number().optional().describe("Minimum values to select"),
  maxValues: z.number().optional().describe("Maximum values to select"),
  options: z
    .array(
      z.object({
        label: z.string().describe("Option label"),
        value: z.string().describe("Option value"),
        description: z.string().optional().describe("Option description"),
        emoji: z.string().optional().describe("Option emoji"),
      }),
    )
    .describe("Select menu options"),
});
