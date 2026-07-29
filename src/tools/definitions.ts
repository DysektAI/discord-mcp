import { applyToolMetadata } from "./metadata.js";
import { discordManageTools } from "./definitions/discord-manage.js";
import { serverTools } from "./definitions/server.js";
import { messagesTools } from "./definitions/messages.js";
import { privateMessagesTools } from "./definitions/private-messages.js";
import { channelsTools } from "./definitions/channels.js";
import { webhooksTools } from "./definitions/webhooks.js";
import { voiceTools } from "./definitions/voice.js";
import { rolesTools } from "./definitions/roles.js";
import { membersTools } from "./definitions/members.js";
import { eventsTools } from "./definitions/events.js";
import { invitesTools } from "./definitions/invites.js";
import { emojisTools } from "./definitions/emojis.js";
import { stickersTools } from "./definitions/stickers.js";
import { filesTools } from "./definitions/files.js";
import { automodTools } from "./definitions/automod.js";
import { interactionsTools } from "./definitions/interactions.js";

export type ToolConfig = {
  oauthEnabled: boolean;
  oauthRequiredScopes: string[];
};

// Complete tools list for both stdio and HTTP
export const getAllTools = ({
  oauthEnabled,
  oauthRequiredScopes,
}: ToolConfig) => {
  const tools = [
    ...discordManageTools,
    ...serverTools,
    ...messagesTools,
    ...privateMessagesTools,
    ...channelsTools,
    ...webhooksTools,
    ...voiceTools,
    ...rolesTools,
    ...membersTools,
    ...eventsTools,
    ...invitesTools,
    ...emojisTools,
    ...stickersTools,
    ...filesTools,
    ...automodTools,
    ...interactionsTools,
  ];

  const toolsWithMeta = tools.map(applyToolMetadata);

  if (!oauthEnabled) {
    return toolsWithMeta;
  }

  const securityScheme =
    oauthRequiredScopes.length > 0
      ? { type: "oauth2", scopes: oauthRequiredScopes }
      : { type: "oauth2" };

  return toolsWithMeta.map((tool) => ({
    ...tool,
    securitySchemes: [securityScheme],
  }));
};
