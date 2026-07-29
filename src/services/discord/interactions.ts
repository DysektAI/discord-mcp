import {
  TextChannel,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import type { DiscordService } from "./service.js";

export const interactionsMethods = {
  async sendModal(this: DiscordService, interactionId?: string, title?: string, customId?: string, components?: any[]): Promise<string> {
      // Note: This is a conceptual implementation as modals are typically sent in response to interactions
      // For MCP tools, this would require an active interaction token which is complex to implement
      throw new Error("Send modal functionality requires an active interaction context. This tool is designed for bot applications with slash commands or button interactions.");
    },

  async sendEmbed(this: DiscordService, 
      channelId?: string, 
      title?: string, 
      description?: string, 
      color?: string, 
      fields?: any[], 
      footer?: string, 
      image?: string, 
      thumbnail?: string
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
        const embed = new EmbedBuilder();
  
        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (color) {
          // Parse hex color
          const colorValue = color.startsWith('#') ? color.slice(1) : color;
          embed.setColor(parseInt(colorValue, 16));
        }
        if (footer) embed.setFooter({ text: footer });
        if (image) embed.setImage(image);
        if (thumbnail) embed.setThumbnail(thumbnail);
  
        if (fields && fields.length > 0) {
          for (const field of fields) {
            if (field.name && field.value) {
              embed.addFields({
                name: field.name,
                value: field.value,
                inline: field.inline || false
              });
            }
          }
        }
  
        const message = await channel.send({ embeds: [embed] });
  
        return `Successfully sent embed to ${channel.name}
  - Title: ${title || 'None'}
  - Fields: ${fields?.length || 0}
  - Color: ${color || 'Default'}
  - Message: ${message.url}`;
      } catch (error) {
        throw new Error(`Failed to send embed: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async sendButton(this: DiscordService, channelId?: string, content?: string, buttons?: any[]): Promise<string> {
      this.ensureReady();
      
      if (!channelId) {
        throw new Error("Channel ID is required");
      }
  
      if (!buttons || buttons.length === 0) {
        throw new Error("At least one button is required");
      }
  
      const channel = this.client.channels.cache.get(channelId) as TextChannel;
      if (!channel || channel.type !== ChannelType.GuildText) {
        throw new Error("Channel not found or not a text channel");
      }
  
      try {
        const actionRows = [];
        const buttonBuilders = [];
  
        for (let i = 0; i < buttons.length; i++) {
          const buttonData = buttons[i];
          
          if (!buttonData.label) {
            throw new Error(`Button ${i + 1} requires a label`);
          }
  
          const button = new ButtonBuilder()
            .setLabel(buttonData.label);
  
          // Set style
          switch (buttonData.style?.toUpperCase()) {
            case 'PRIMARY':
              button.setStyle(ButtonStyle.Primary);
              break;
            case 'SECONDARY':
              button.setStyle(ButtonStyle.Secondary);
              break;
            case 'SUCCESS':
              button.setStyle(ButtonStyle.Success);
              break;
            case 'DANGER':
              button.setStyle(ButtonStyle.Danger);
              break;
            case 'LINK':
              button.setStyle(ButtonStyle.Link);
              if (buttonData.url) {
                button.setURL(buttonData.url);
              } else {
                throw new Error(`Link button "${buttonData.label}" requires a URL`);
              }
              break;
            default:
              button.setStyle(ButtonStyle.Secondary);
          }
  
          // Set custom ID for non-link buttons
          if (buttonData.style?.toUpperCase() !== 'LINK') {
            button.setCustomId(buttonData.customId || `button_${Date.now()}_${i}`);
          }
  
          // Set emoji if provided
          if (buttonData.emoji) {
            button.setEmoji(buttonData.emoji);
          }
  
          buttonBuilders.push(button);
  
          // Create action row every 5 buttons (Discord limit)
          if (buttonBuilders.length === 5 || i === buttons.length - 1) {
            const actionRow = new ActionRowBuilder<ButtonBuilder>()
              .addComponents(...buttonBuilders);
            actionRows.push(actionRow);
            buttonBuilders.length = 0; // Clear array
          }
        }
  
        const messageOptions: any = { components: actionRows };
        if (content) {
          messageOptions.content = content;
        }
  
        const message = await channel.send(messageOptions);
  
        return `Successfully sent buttons to ${channel.name}
  - Button count: ${buttons.length}
  - Content: ${content || 'None'}
  - Message: ${message.url}`;
      } catch (error) {
        throw new Error(`Failed to send buttons: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

  async sendSelectMenu(this: DiscordService, 
      channelId?: string, 
      content?: string, 
      customId?: string, 
      placeholder?: string, 
      minValues?: number, 
      maxValues?: number, 
      options?: any[]
    ): Promise<string> {
      this.ensureReady();
      
      if (!channelId) {
        throw new Error("Channel ID is required");
      }
  
      if (!options || options.length === 0) {
        throw new Error("At least one option is required");
      }
  
      if (options.length > 25) {
        throw new Error("Maximum 25 options allowed in a select menu");
      }
  
      const channel = this.client.channels.cache.get(channelId) as TextChannel;
      if (!channel || channel.type !== ChannelType.GuildText) {
        throw new Error("Channel not found or not a text channel");
      }
  
      try {
        const selectMenuBuilder = new StringSelectMenuBuilder()
          .setCustomId(customId || `select_${Date.now()}`)
          .setPlaceholder(placeholder || 'Select an option')
          .setMinValues(minValues || 1)
          .setMaxValues(maxValues || 1);
  
        const selectOptions = [];
        for (let i = 0; i < options.length; i++) {
          const optionData = options[i];
          
          if (!optionData.label || !optionData.value) {
            throw new Error(`Option ${i + 1} requires both label and value`);
          }
  
          const option = new StringSelectMenuOptionBuilder()
            .setLabel(optionData.label)
            .setValue(optionData.value);
  
          if (optionData.description) {
            option.setDescription(optionData.description);
          }
  
          if (optionData.emoji) {
            option.setEmoji(optionData.emoji);
          }
  
          selectOptions.push(option);
        }
  
        selectMenuBuilder.addOptions(selectOptions);
  
        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(selectMenuBuilder);
  
        const messageOptions: any = { components: [actionRow] };
        if (content) {
          messageOptions.content = content;
        }
  
        const message = await channel.send(messageOptions);
  
        return `Successfully sent select menu to ${channel.name}
  - Options: ${options.length}
  - Range: ${minValues || 1}-${maxValues || 1} selections
  - Content: ${content || 'None'}
  - Message: ${message.url}`;
      } catch (error) {
        throw new Error(`Failed to send select menu: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
};

export type InteractionsMethods = typeof interactionsMethods;
