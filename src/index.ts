#!/usr/bin/env node
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { DiscordService } from "./discord-service.js";
import { AutomationManager } from "./core/AutomationManager.js";
import { DiscordController } from "./core/DiscordController.js";
import * as schemas from "./types.js";
import { getAllTools } from "./tools/definitions.js";
import {
  createToolHandlers,
  type ToolHandler,
} from "./tools/handlers/registry.js";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { timingSafeEqual } from "node:crypto";
import { URL } from "node:url";
import { ErrorHandler } from "./core/ErrorHandler.js";
import { sanitizeForLog } from "./core/LogSanitizer.js";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const server = new Server(
  {
    name: "discord-mcp-server",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

let discordService: DiscordService;
let automationManager: AutomationManager;
let discordController: DiscordController;
let toolHandlers: Map<string, ToolHandler>;

const oauthEnabled = process.env.MCP_OAUTH_ENABLED === "true";
const oauthIssuer =
  process.env.MCP_OAUTH_ISSUER ||
  process.env.SUPABASE_AUTH_BASE_URL ||
  (process.env.SUPABASE_PROJECT_REF
    ? `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/auth/v1`
    : undefined);
const oauthJwksUrl =
  process.env.MCP_OAUTH_JWKS_URL ||
  (oauthIssuer ? `${oauthIssuer}/.well-known/jwks.json` : undefined);
const oauthAuthServers = (process.env.MCP_OAUTH_AUTHORIZATION_SERVERS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const oauthScopesSupported = (process.env.MCP_OAUTH_SCOPES_SUPPORTED || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const oauthRequiredScopes = (process.env.MCP_OAUTH_REQUIRED_SCOPES || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const oauthAudience = process.env.MCP_OAUTH_AUDIENCE;
const oauthResource =
  process.env.MCP_OAUTH_RESOURCE || process.env.MCP_PUBLIC_URL;
const oauthConsentPath = process.env.MCP_OAUTH_CONSENT_PATH || "/oauth/consent";
const supabaseUrl =
  process.env.SUPABASE_URL ||
  (process.env.SUPABASE_PROJECT_REF
    ? `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co`
    : undefined);
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const oauthAllowedUserIds = (process.env.MCP_OAUTH_ALLOWED_USER_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const oauthAllowedEmails = (process.env.MCP_OAUTH_ALLOWED_EMAILS || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
const httpLoggingEnabled =
  process.env.MCP_HTTP_LOG_REQUESTS !== "false" &&
  process.env.ENABLE_LOGGING === "true";

function logHttp(message: string): void {
  if (!httpLoggingEnabled) return;
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [HTTP] ${message}`);
}

// Initialize Discord service
async function initializeDiscord() {
  discordController = new DiscordController();
  await discordController.initialize();
  discordService = discordController.getDiscordService();
  automationManager = discordController.getAutomationManager();
  toolHandlers = createToolHandlers(discordService);
}

function assertActionAllowed(action: string): void {
  const configManager = discordController?.getConfigManager?.();
  if (configManager && !configManager.isActionAllowed(action)) {
    logHttp(`tool_blocked action=${action}`);
    throw ErrorHandler.createPermissionError(
      `Action '${action}' is not allowed`,
    );
  }
}

function getRequestOrigin(req: IncomingMessage): string {
  const host = req.headers.host || "";
  const forwarded = req.headers["x-forwarded-proto"];
  let proto = "https";
  if (Array.isArray(forwarded)) {
    proto = forwarded[0] || proto;
  } else if (typeof forwarded === "string" && forwarded) {
    proto = forwarded.split(",")[0].trim() || proto;
  } else if (typeof req.headers["cf-visitor"] === "string") {
    try {
      const parsed = JSON.parse(req.headers["cf-visitor"]);
      if (parsed?.scheme) proto = parsed.scheme;
    } catch {
      // ignore malformed header
    }
  }
  return `${proto}://${host}`;
}

function getResourceUrl(req: IncomingMessage): string {
  return oauthResource || getRequestOrigin(req);
}

function getResourceMetadataUrl(req: IncomingMessage): string {
  return `${getResourceUrl(req)}/.well-known/oauth-protected-resource`;
}

function buildProtectedResourceMetadata(req: IncomingMessage) {
  return {
    resource: getResourceUrl(req),
    authorization_servers:
      oauthAuthServers.length > 0
        ? oauthAuthServers
        : oauthIssuer
          ? [oauthIssuer]
          : [],
    scopes_supported:
      oauthScopesSupported.length > 0 ? oauthScopesSupported : undefined,
    resource_documentation: process.env.MCP_RESOURCE_DOCUMENTATION || undefined,
  };
}

function buildConsentPageHtml(): string {
  const missing = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Consent</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; background: #0f1115; color: #e6e6e6; }
      .card { max-width: 560px; margin: 0 auto; background: #171a21; padding: 24px; border-radius: 12px; }
      code { background: #0f1115; padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Consent Page Misconfigured</h2>
      <p>Missing required environment variables:</p>
      <ul>
        ${missing.map((item) => `<li><code>${item}</code></li>`).join("")}
      </ul>
    </div>
  </body>
</html>`;
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authorize MCP Access</title>
    <style>
      body { font-family: "Segoe UI", Arial, sans-serif; background: #0f1115; color: #e6e6e6; margin: 0; padding: 40px; }
      .card { max-width: 640px; margin: 0 auto; background: #171a21; border-radius: 14px; padding: 28px; box-shadow: 0 8px 30px rgba(0,0,0,0.35); }
      h1 { margin-top: 0; font-size: 22px; }
      .muted { color: #9aa4b2; }
      .scopes { margin: 16px 0; padding: 12px; background: #12161d; border-radius: 10px; }
      .actions { display: flex; gap: 12px; margin-top: 24px; }
      button { border: 0; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-weight: 600; }
      .approve { background: #3b82f6; color: white; }
      .deny { background: #1f2937; color: #e6e6e6; }
      .error { color: #f87171; margin-top: 12px; }
      .hidden { display: none; }
      .loading { color: #9aa4b2; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Authorize MCP Access</h1>
      <p class="muted" id="clientName">Loading client details...</p>
      <div class="scopes">
        <strong>Requested access</strong>
        <ul id="scopeList"><li class="loading">Loading scopes…</li></ul>
      </div>
      <div class="actions">
        <button class="approve" id="approveBtn">Approve</button>
        <button class="deny" id="denyBtn">Deny</button>
      </div>
      <p class="error hidden" id="errorBox"></p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
      const supabaseUrl = ${JSON.stringify(supabaseUrl)};
      const supabaseAnonKey = ${JSON.stringify(supabaseAnonKey)};
      const { createClient } = supabase;

      const errorBox = document.getElementById('errorBox');
      const clientName = document.getElementById('clientName');
      const scopeList = document.getElementById('scopeList');
      const approveBtn = document.getElementById('approveBtn');
      const denyBtn = document.getElementById('denyBtn');

      function showError(message) {
        errorBox.textContent = message;
        errorBox.classList.remove('hidden');
      }

      function setLoading(message) {
        clientName.textContent = message;
      }

      async function main() {
        const params = new URLSearchParams(window.location.search);
        const authorizationId = params.get('authorization_id');

        if (!authorizationId) {
          showError('Missing authorization_id in URL.');
          approveBtn.disabled = true;
          denyBtn.disabled = true;
          return;
        }

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false }
        });

        const { data, error } = await supabaseClient.auth.oauth.getAuthorizationDetails(authorizationId);
        if (error || !data) {
          showError(error?.message || 'Unable to load authorization details.');
          approveBtn.disabled = true;
          denyBtn.disabled = true;
          return;
        }

        const requestedScopes = data?.requested_scopes || [];
        clientName.textContent = data?.client?.name
          ? \`App: \${data.client.name}\`
          : 'App requesting access';

        scopeList.innerHTML = '';
        if (requestedScopes.length === 0) {
          const li = document.createElement('li');
          li.textContent = 'No scopes requested.';
          scopeList.appendChild(li);
        } else {
          requestedScopes.forEach((scope) => {
            const li = document.createElement('li');
            li.textContent = scope;
            scopeList.appendChild(li);
          });
        }

        approveBtn.addEventListener('click', async () => {
          const { data: approval, error: approveError } =
            await supabaseClient.auth.oauth.approveAuthorization(authorizationId);
          if (approveError || !approval?.redirect_to) {
            showError(approveError?.message || 'Approval failed.');
            return;
          }
          window.location.href = approval.redirect_to;
        });

        denyBtn.addEventListener('click', async () => {
          const { data: denial, error: denyError } =
            await supabaseClient.auth.oauth.denyAuthorization(authorizationId);
          if (denyError || !denial?.redirect_to) {
            showError(denyError?.message || 'Denial failed.');
            return;
          }
          window.location.href = denial.redirect_to;
        });
      }

      setLoading('Loading authorization details...');
      main();
    </script>
  </body>
</html>`;
}

function getBearerToken(req: IncomingMessage): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return null;
  if (value.startsWith("Bearer ")) return value.slice(7).trim();
  return value.trim();
}

function buildWwwAuthenticate(req: IncomingMessage): string {
  const scope =
    oauthRequiredScopes.length > 0 ? oauthRequiredScopes.join(" ") : undefined;
  const resourceMetadata = getResourceMetadataUrl(req);
  if (scope) {
    return `Bearer resource_metadata="${resourceMetadata}", scope="${scope}"`;
  }
  return `Bearer resource_metadata="${resourceMetadata}"`;
}

function constantTimeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function validateHttpSecurityConfig(): void {
  const useHttp = process.env.MCP_HTTP_PORT || process.env.PORT;
  if (!useHttp) {
    return;
  }

  const authToken = process.env.MCP_HTTP_AUTH_TOKEN?.trim();

  if (!oauthEnabled && !authToken) {
    throw new Error(
      "HTTP transport requires either MCP_OAUTH_ENABLED=true or MCP_HTTP_AUTH_TOKEN.",
    );
  }

  if (authToken && authToken.length < 24) {
    throw new Error(
      "MCP_HTTP_AUTH_TOKEN must be at least 24 characters long.",
    );
  }

  if (oauthEnabled && !oauthResource) {
    throw new Error(
      "MCP_OAUTH_RESOURCE must be set when OAuth and HTTP transport are enabled.",
    );
  }
}

async function verifyOAuthToken(
  token: string,
  req: IncomingMessage,
): Promise<JWTPayload> {
  if (!oauthIssuer || !oauthJwksUrl) {
    throw new Error(
      "OAuth is enabled but issuer or JWKS URL is not configured.",
    );
  }
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(oauthJwksUrl));
  }
  const verifyOptions: Parameters<typeof jwtVerify>[2] = {
    issuer: oauthIssuer,
  };
  if (oauthAudience) {
    verifyOptions.audience = oauthAudience;
  }
  const { payload } = await jwtVerify(token, jwks, verifyOptions);

  if (oauthResource) {
    const expected = oauthResource;
    const aud = payload.aud;
    const resourceClaim = (payload as JWTPayload & { resource?: string })
      .resource;
    const audList = Array.isArray(aud) ? aud : aud ? [aud] : [];
    if (resourceClaim !== expected && !audList.includes(expected)) {
      throw new Error("Token audience/resource mismatch.");
    }
  }

  if (oauthRequiredScopes.length > 0) {
    const scopeValue = typeof payload.scope === "string" ? payload.scope : "";
    const tokenScopes = scopeValue
      .split(" ")
      .map((value) => value.trim())
      .filter(Boolean);
    for (const required of oauthRequiredScopes) {
      if (!tokenScopes.includes(required)) {
        throw new Error(`Missing required scope: ${required}`);
      }
    }
  }

  if (oauthAllowedUserIds.length > 0) {
    const userId = typeof payload.sub === "string" ? payload.sub : "";
    if (!oauthAllowedUserIds.includes(userId)) {
      throw new Error("User not allowed.");
    }
  }

  if (oauthAllowedEmails.length > 0) {
    const email =
      typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    if (!email || !oauthAllowedEmails.includes(email)) {
      throw new Error("User not allowed.");
    }
  }

  return payload;
}

async function requireOAuth(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<JWTPayload | null> {
  if (!oauthEnabled) return null;
  const token = getBearerToken(req);
  if (!token) {
    res.writeHead(401, {
      "Content-Type": "application/json",
      "WWW-Authenticate": buildWwwAuthenticate(req),
    });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return null;
  }
  try {
    return await verifyOAuthToken(token, req);
  } catch {
    res.writeHead(401, {
      "Content-Type": "application/json",
      "WWW-Authenticate": buildWwwAuthenticate(req),
    });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return null;
  }
}

function isAuthorized(req: IncomingMessage, authToken?: string): boolean {
  if (!authToken) return true;
  const header = req.headers["authorization"];
  if (!header) return false;
  const value = Array.isArray(header) ? header[0] : header;
  const token = value.startsWith("Bearer ")
    ? value.slice(7).trim()
    : value.trim();
  return constantTimeEquals(token, authToken);
}

function rejectUnauthorized(res: ServerResponse): void {
  res.writeHead(401, {
    "Content-Type": "application/json",
    "WWW-Authenticate": "Bearer",
  });
  res.end(JSON.stringify({ error: "Unauthorized" }));
}

async function readBody(
  req: IncomingMessage,
  res: ServerResponse,
  maxBytes: number,
): Promise<string | null> {
  return await new Promise((resolve) => {
    let body = "";
    let tooLarge = false;

    req.on("data", (chunk) => {
      if (tooLarge) return;
      body += chunk.toString();
      if (body.length > maxBytes) {
        tooLarge = true;
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
        req.destroy();
        resolve(null);
      }
    });

    req.on("end", () => {
      if (tooLarge) return;
      resolve(body);
    });

    req.on("error", () => {
      if (!res.headersSent) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
      resolve(null);
    });
  });
}

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getAllTools({ oauthEnabled, oauthRequiredScopes }),
  };
});

// Tool request handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    if (httpLoggingEnabled) {
      const actionHint =
        name === "discord_manage" && (args as any)?.action
          ? ` action=${(args as any).action}`
          : "";
      logHttp(`tool_call name=${name}${actionHint}`);
    }
    if (name !== "discord_manage") {
      assertActionAllowed(name);
    }

    if (name === "discord_manage") {
      const { action, ...params } = args as any;

      if (!action) {
        throw new Error("Action parameter is required for discord_manage tool");
      }
      assertActionAllowed(action);

      // Route to the original implementations based on action
      // This preserves all existing functionality while providing a unified interface
      switch (action) {
        case "get_server_info": {
          const parsed = schemas.ServerInfoSchema.parse(params);
          const result = await discordService.getServerInfo(parsed.guildId);
          return { content: [{ type: "text", text: result }] };
        }
        case "send_message": {
          const parsed = schemas.SendMessageSchema.parse(params);
          const result = await discordService.sendMessage(
            parsed.channelId,
            parsed.message,
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "reply_message": {
          const parsed = schemas.ReplyMessageSchema.parse(params);
          const result = await discordService.replyMessage(
            parsed.channelId,
            parsed.messageId,
            parsed.message,
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "edit_message": {
          const parsed = schemas.EditMessageSchema.parse(params);
          const result = await discordService.editMessage(
            parsed.channelId,
            parsed.messageId,
            parsed.newMessage,
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "delete_message": {
          const parsed = schemas.DeleteMessageSchema.parse(params);
          const result = await discordService.deleteMessage(
            parsed.channelId,
            parsed.messageId,
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "read_messages": {
          const parsed = schemas.ReadMessagesSchema.parse(params);
          const result = await discordService.readMessages(
            parsed.channelId,
            parsed.count,
          );
          return { content: [{ type: "text", text: result }] };
        }
        case "read_images": {
          const parsed = schemas.ReadImagesSchema.parse(params);
          const result = await discordService.readImages(
            parsed.channelId,
            parsed.messageId,
            parsed.limit,
            parsed.includeMetadata,
            parsed.downloadImages,
          );
          return { content: [{ type: "text", text: result }] };
        }
        // Note: For brevity, I'm including key actions here. In production,
        // all 109+ actions would be mapped following the same pattern
        default:
          throw new Error(
            `Action '${action}' not yet implemented in consolidated handler. Use individual tools for now.`,
          );
      }
    }

    const handler = toolHandlers?.get(name);
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }
    const result = await handler(args);
    return { content: [{ type: "text", text: result }] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logHttp(`tool_call_error ${sanitizeForLog(errorMessage)}`);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

// Main function
async function main() {
  try {
    validateHttpSecurityConfig();

    // Initialize Discord first
    await initializeDiscord();

    if (oauthEnabled && (!oauthIssuer || !oauthJwksUrl)) {
      console.error(
        "OAuth is enabled but MCP_OAUTH_ISSUER/SUPABASE_AUTH_BASE_URL or MCP_OAUTH_JWKS_URL is missing.",
      );
      process.exit(1);
    }

    // Check if we should use HTTP transport
    const useHttp = process.env.MCP_HTTP_PORT || process.env.PORT;

    if (useHttp) {
      // Start HTTP server
      const port = parseInt(useHttp) || 3000;
      const authToken = process.env.MCP_HTTP_AUTH_TOKEN;
      const maxBodyBytes = parseInt(
        process.env.MCP_HTTP_MAX_BODY_BYTES || "5000000",
        10,
      );

      // Map to store active transports by session ID
      const activeTransports = new Map();

      const httpServer = createServer(async (req, res) => {
        const url = new URL(req.url || "/", `http://${req.headers.host}`);
        const requestId = Math.random().toString(36).slice(2, 8);
        const startedAt = Date.now();
        logHttp(`${requestId} ${req.method} ${url.pathname}`);
        res.on("finish", () => {
          const durationMs = Date.now() - startedAt;
          logHttp(
            `${requestId} ${req.method} ${url.pathname} -> ${res.statusCode} ${durationMs}ms`,
          );
        });

        // CORS headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization",
        );

        if (req.method === "OPTIONS") {
          res.writeHead(200);
          res.end();
          return;
        }

        if (
          oauthEnabled &&
          url.pathname === "/.well-known/oauth-protected-resource" &&
          req.method === "GET"
        ) {
          const metadata = buildProtectedResourceMetadata(req);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(metadata));
          return;
        }

        if (
          oauthEnabled &&
          url.pathname === oauthConsentPath &&
          req.method === "GET"
        ) {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(buildConsentPageHtml());
          return;
        }

        if (oauthEnabled && url.pathname !== "/health") {
          const verified = await requireOAuth(req, res);
          if (!verified) {
            return;
          }
        } else if (authToken && url.pathname !== "/health") {
          if (!isAuthorized(req, authToken)) {
            rejectUnauthorized(res);
            return;
          }
        }

        try {
          if (
            req.method === "POST" &&
            req.headers["content-type"]?.includes("application/json")
          ) {
            // Handle JSON-RPC over HTTP (mcp-remote style)
            const body = await readBody(req, res, maxBodyBytes);
            if (body === null) {
              return;
            }
            try {
              const message = JSON.parse(body);

              // Handle the JSON-RPC request directly
              if (message.method === "initialize") {
                logHttp(`${requestId} rpc initialize`);
                const response = {
                  jsonrpc: "2.0",
                  id: message.id,
                  result: {
                    protocolVersion: "2024-11-05",
                    capabilities: {
                      tools: {},
                    },
                    serverInfo: {
                      name: "discord-mcp-server",
                      version: "0.0.1",
                    },
                  },
                };
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(response));
              } else if (message.method === "tools/list") {
                logHttp(`${requestId} rpc tools/list`);
                // Return complete tools list
                const tools = getAllTools({
                  oauthEnabled,
                  oauthRequiredScopes,
                });
                const response = {
                  jsonrpc: "2.0",
                  id: message.id,
                  result: { tools },
                };
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(response));
              } else if (message.method === "tools/call") {
                // Handle tool call by name
                try {
                  let { name, arguments: args } = message.params;
                  const actionHint =
                    name === "discord_manage" && (args as any)?.action
                      ? ` action=${(args as any).action}`
                      : "";
                  logHttp(
                    `${requestId} rpc tools/call name=${name}${actionHint}`,
                  );
                  if (name === "discord_manage") {
                    const action = (args as any)?.action;
                    if (!action) {
                      throw new Error(
                        "Action parameter is required for discord_manage tool",
                      );
                    }
                    assertActionAllowed(action);
                    const { action: _action, ...params } = args as any;
                    logHttp(
                      `${requestId} rpc tools/call mapped=discord_manage action=${action}`,
                    );
                    name = action;
                    args = params;
                  } else {
                    assertActionAllowed(name);
                  }
                  let result;

                  const handler = toolHandlers?.get(name);
                  if (!handler) {
                    throw new Error(`Unknown tool: ${name}`);
                  }
                  result = await handler(args);

                  const response = {
                    jsonrpc: "2.0",
                    id: message.id,
                    result: { content: [{ type: "text", text: result }] },
                  };
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify(response));
                } catch (error) {
                  // Log the error and stack trace on the server
                  console.error(
                    `Error in tools/call: ${sanitizeForLog(error)}`,
                  );
                  const response = {
                    jsonrpc: "2.0",
                    id: message.id,
                    error: {
                      code: -32000,
                      message: "An internal error occurred",
                    },
                  };
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify(response));
                }
              } else {
                // Unknown method
                const response = {
                  jsonrpc: "2.0",
                  id: message.id,
                  error: {
                    code: -32601,
                    message: "Method not found",
                  },
                };
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(response));
              }
            } catch (error) {
              const response = {
                jsonrpc: "2.0",
                id: null,
                error: {
                  code: -32700,
                  message: "Parse error",
                },
              };
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify(response));
            }
          } else if (url.pathname === "/sse" && req.method === "GET") {
            // SSE connection
            const transport = new SSEServerTransport("/message", res);
            activeTransports.set(transport.sessionId, transport);
            await server.connect(transport);
            await transport.start();
            transport.onclose = () => {
              activeTransports.delete(transport.sessionId);
            };
          } else if (url.pathname === "/message" && req.method === "POST") {
            // Handle POST messages from mcp-remote
            const body = await readBody(req, res, maxBodyBytes);
            if (body === null) {
              return;
            }
            try {
              // Get session ID from URL params or headers
              const sessionId =
                url.searchParams.get("sessionId") ||
                req.headers["x-session-id"];
              const transport = activeTransports.get(sessionId);

              if (transport) {
                const message = JSON.parse(body);
                await transport.handleMessage(message);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
              } else {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Session not found" }));
              }
            } catch (error) {
              // Log the error and stack trace on the server for debugging
              console.error(
                `Error handling /message POST: ${sanitizeForLog(error)}`,
              );
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid request" }));
            }
          } else if (url.pathname === "/health" && req.method === "GET") {
            // Health check
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                status: "ok",
                server: "discord-mcp",
                activeConnections: activeTransports.size,
              }),
            );
          } else {
            // Default response with mcp-remote instructions
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(`Discord MCP Server

MCP Remote Usage:
npx -y mcp-remote ${req.headers.host}

Endpoints:
- GET /sse - SSE connection
- POST /message - Message handling  
- GET /health - Health check

Active connections: ${activeTransports.size}`);
          }
        } catch (error) {
          console.error(`HTTP request error: ${sanitizeForLog(error)}`);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal server error" }));
        }
      });

      httpServer.listen(port, () => {
        console.error(`Discord MCP server running on HTTP port ${port}`);
        console.error(`SSE endpoint: http://localhost:${port}/sse`);
        console.error(`Health check: http://localhost:${port}/health`);
      });
    } else {
      // Start stdio server (default)
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error("Discord MCP server running on stdio");
    }
  } catch (error) {
    console.error(
      `Failed to start Discord MCP server: ${sanitizeForLog(error)}`,
    );
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.error("Shutting down Discord MCP server...");
  if (discordService) {
    await discordService.destroy();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("Shutting down Discord MCP server...");
  if (discordService) {
    await discordService.destroy();
  }
  process.exit(0);
});

// Run the server
main().catch((error) => {
  console.error(`Fatal error: ${sanitizeForLog(error)}`);
  process.exit(1);
});
