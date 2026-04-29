import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export type McpAuthMode = "off" | "required" | "mixed";

export interface McpAuthConfig {
    mode: McpAuthMode;
    staticBearerToken?: string;
    oauthEnabled: boolean;
    issuer?: string;
    jwksUrl?: string;
    audience?: string;
    resource?: string;
    authorizationServers: string[];
    scopesSupported: string[];
    requiredScopes: string[];
    allowedUserIds: string[];
    allowedEmails: string[];
    consentPath: string;
    resourceDocumentation?: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
}

type AuthFailure = {
    status: 401;
    headers: Record<string, string>;
    body: { error: "Unauthorized" };
};

type AuthSuccess = {
    payload?: JWTPayload;
};

type AuthResult = AuthFailure | AuthSuccess;

type SecurityScheme =
    | {
          type: "oauth2";
          scopes?: string[];
      }
    | {
          type: "http";
          scheme: "bearer";
      };

function parseCsv(value?: string): string[] {
    if (!value) {
        return [];
    }
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function normalizeEmailList(value?: string): string[] {
    return parseCsv(value).map((email) => email.toLowerCase());
}

function parseAuthMode(): McpAuthMode {
    const explicit = process.env.MCP_AUTH_MODE?.trim().toLowerCase();
    if (explicit === "off" || explicit === "required" || explicit === "mixed") {
        return explicit;
    }

    if (
        process.env.MCP_OAUTH_ENABLED === "true" ||
        process.env.MCP_HTTP_AUTH_TOKEN
    ) {
        return "mixed";
    }

    return "off";
}

function firstHeader(headers: Headers, name: string): string | undefined {
    const value = headers.get(name);
    if (!value) {
        return undefined;
    }
    return value.split(",")[0]?.trim() || undefined;
}

function getBearerToken(headers: Headers): string | null {
    const value = headers.get("authorization");
    if (!value) {
        return null;
    }

    if (value.startsWith("Bearer ")) {
        return value.slice(7).trim();
    }

    return value.trim();
}

export class McpAuthManager {
    private readonly config: McpAuthConfig;
    private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

    constructor(config: McpAuthConfig) {
        this.config = config;
    }

    static fromEnv(): McpAuthManager {
        const supabaseProjectRef = process.env.SUPABASE_PROJECT_REF;
        const issuer =
            process.env.MCP_OAUTH_ISSUER ||
            process.env.SUPABASE_AUTH_BASE_URL ||
            (supabaseProjectRef
                ? `https://${supabaseProjectRef}.supabase.co/auth/v1`
                : undefined);
        const jwksUrl =
            process.env.MCP_OAUTH_JWKS_URL ||
            (issuer ? `${issuer}/.well-known/jwks.json` : undefined);
        const authorizationServers = parseCsv(
            process.env.MCP_OAUTH_AUTHORIZATION_SERVERS,
        );
        const supabaseUrl =
            process.env.SUPABASE_URL ||
            (supabaseProjectRef
                ? `https://${supabaseProjectRef}.supabase.co`
                : undefined);

        return new McpAuthManager({
            mode: parseAuthMode(),
            staticBearerToken: process.env.MCP_HTTP_AUTH_TOKEN,
            oauthEnabled: process.env.MCP_OAUTH_ENABLED === "true",
            issuer,
            jwksUrl,
            audience: process.env.MCP_OAUTH_AUDIENCE,
            resource: process.env.MCP_OAUTH_RESOURCE || process.env.MCP_PUBLIC_URL,
            authorizationServers,
            scopesSupported: parseCsv(process.env.MCP_OAUTH_SCOPES_SUPPORTED),
            requiredScopes: parseCsv(process.env.MCP_OAUTH_REQUIRED_SCOPES),
            allowedUserIds: parseCsv(process.env.MCP_OAUTH_ALLOWED_USER_IDS),
            allowedEmails: normalizeEmailList(
                process.env.MCP_OAUTH_ALLOWED_EMAILS,
            ),
            consentPath: process.env.MCP_OAUTH_CONSENT_PATH || "/oauth/consent",
            resourceDocumentation: process.env.MCP_RESOURCE_DOCUMENTATION,
            supabaseUrl,
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
        });
    }

    getMode(): McpAuthMode {
        return this.config.mode;
    }

    isEnabled(): boolean {
        return this.config.mode !== "off";
    }

    getConsentPath(): string {
        return this.config.consentPath;
    }

    getStartupErrors(): string[] {
        if (!this.isEnabled()) {
            return [];
        }

        const errors: string[] = [];
        const hasVerifier = Boolean(
            this.config.staticBearerToken ||
                (this.config.oauthEnabled &&
                    this.config.issuer &&
                    this.config.jwksUrl),
        );

        if (!hasVerifier) {
            errors.push(
                "MCP auth is enabled but no verifier is configured. Set MCP_HTTP_AUTH_TOKEN or MCP_OAUTH_ISSUER/MCP_OAUTH_JWKS_URL.",
            );
        }

        if (
            this.config.oauthEnabled &&
            (!this.config.issuer || !this.config.jwksUrl)
        ) {
            errors.push(
                "MCP_OAUTH_ENABLED=true requires MCP_OAUTH_ISSUER and MCP_OAUTH_JWKS_URL, or SUPABASE_PROJECT_REF/SUPABASE_AUTH_BASE_URL.",
            );
        }

        return errors;
    }

    shouldAuthenticateJsonRpcMethod(method?: string): boolean {
        if (!this.isEnabled()) {
            return false;
        }
        if (this.config.mode === "required") {
            return true;
        }
        return method === "tools/call";
    }

    shouldAuthenticateTransport(): boolean {
        return this.config.mode === "required";
    }

    getSecuritySchemes(): SecurityScheme[] {
        if (!this.isEnabled()) {
            return [];
        }

        const schemes: SecurityScheme[] = [];
        if (this.config.oauthEnabled) {
            schemes.push(
                this.config.requiredScopes.length > 0
                    ? {
                          type: "oauth2",
                          scopes: this.config.requiredScopes,
                      }
                    : { type: "oauth2" },
            );
        }
        if (this.config.staticBearerToken) {
            schemes.push({ type: "http", scheme: "bearer" });
        }
        return schemes;
    }

    getResourceUrl(headers: Headers, rawUrl: string): string {
        if (this.config.resource) {
            return this.config.resource;
        }

        const host = headers.get("host") || new URL(rawUrl).host;
        let proto = firstHeader(headers, "x-forwarded-proto") || "https";
        const cfVisitor = headers.get("cf-visitor");
        if (!headers.get("x-forwarded-proto") && cfVisitor) {
            try {
                const parsed = JSON.parse(cfVisitor);
                if (typeof parsed?.scheme === "string") {
                    proto = parsed.scheme;
                }
            } catch {
                // Ignore malformed Cloudflare metadata.
            }
        }

        return `${proto}://${host}`;
    }

    getProtectedResourceMetadataUrl(headers: Headers, rawUrl: string): string {
        return `${this.getResourceUrl(headers, rawUrl)}/.well-known/oauth-protected-resource`;
    }

    buildProtectedResourceMetadata(headers: Headers, rawUrl: string) {
        const authorizationServers =
            this.config.authorizationServers.length > 0
                ? this.config.authorizationServers
                : this.config.issuer
                  ? [this.config.issuer]
                  : [];

        return {
            resource: this.getResourceUrl(headers, rawUrl),
            authorization_servers: authorizationServers,
            scopes_supported:
                this.config.scopesSupported.length > 0
                    ? this.config.scopesSupported
                    : undefined,
            resource_documentation: this.config.resourceDocumentation,
            bearer_methods_supported: ["header"],
        };
    }

    buildWwwAuthenticate(headers: Headers, rawUrl: string): string {
        const resourceMetadata = this.getProtectedResourceMetadataUrl(
            headers,
            rawUrl,
        );
        const scope =
            this.config.requiredScopes.length > 0
                ? this.config.requiredScopes.join(" ")
                : undefined;

        if (scope) {
            return `Bearer resource_metadata="${resourceMetadata}", scope="${scope}"`;
        }
        return `Bearer resource_metadata="${resourceMetadata}"`;
    }

    async authenticate(headers: Headers, rawUrl: string): Promise<AuthResult> {
        if (!this.isEnabled()) {
            return {};
        }

        const token = getBearerToken(headers);
        if (!token) {
            return this.authFailure(headers, rawUrl);
        }

        if (this.config.staticBearerToken && token === this.config.staticBearerToken) {
            return {};
        }

        if (!this.config.oauthEnabled) {
            return this.authFailure(headers, rawUrl);
        }

        try {
            const payload = await this.verifyOAuthToken(token);
            return { payload };
        } catch {
            return this.authFailure(headers, rawUrl);
        }
    }

    buildConsentPageHtml(): string {
        const missing: string[] = [];
        if (!this.config.supabaseUrl) {
            missing.push("SUPABASE_URL");
        }
        if (!this.config.supabaseAnonKey) {
            missing.push("SUPABASE_ANON_KEY");
        }

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
        <ul id="scopeList"><li class="loading">Loading scopes...</li></ul>
      </div>
      <div class="actions">
        <button class="approve" id="approveBtn">Approve</button>
        <button class="deny" id="denyBtn">Deny</button>
      </div>
      <p class="error hidden" id="errorBox"></p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
      const supabaseUrl = ${JSON.stringify(this.config.supabaseUrl)};
      const supabaseAnonKey = ${JSON.stringify(this.config.supabaseAnonKey)};
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

    private authFailure(headers: Headers, rawUrl: string): AuthFailure {
        return {
            status: 401,
            headers: {
                "WWW-Authenticate": this.buildWwwAuthenticate(headers, rawUrl),
            },
            body: { error: "Unauthorized" },
        };
    }

    private async verifyOAuthToken(token: string): Promise<JWTPayload> {
        if (!this.config.issuer || !this.config.jwksUrl) {
            throw new Error("OAuth verifier is not configured.");
        }
        if (!this.jwks) {
            this.jwks = createRemoteJWKSet(new URL(this.config.jwksUrl));
        }

        const verifyOptions: Parameters<typeof jwtVerify>[2] = {
            issuer: this.config.issuer,
        };
        if (this.config.audience) {
            verifyOptions.audience = this.config.audience;
        }

        const { payload } = await jwtVerify(token, this.jwks, verifyOptions);

        if (this.config.resource) {
            const expected = this.config.resource;
            const aud = payload.aud;
            const resourceClaim = (payload as JWTPayload & { resource?: string })
                .resource;
            const audList = Array.isArray(aud) ? aud : aud ? [aud] : [];
            if (resourceClaim !== expected && !audList.includes(expected)) {
                throw new Error("Token audience/resource mismatch.");
            }
        }

        if (this.config.requiredScopes.length > 0) {
            const scopeValue =
                typeof payload.scope === "string" ? payload.scope : "";
            const tokenScopes = scopeValue
                .split(" ")
                .map((value) => value.trim())
                .filter(Boolean);
            for (const required of this.config.requiredScopes) {
                if (!tokenScopes.includes(required)) {
                    throw new Error(`Missing required scope: ${required}`);
                }
            }
        }

        if (this.config.allowedUserIds.length > 0) {
            const userId = typeof payload.sub === "string" ? payload.sub : "";
            if (!this.config.allowedUserIds.includes(userId)) {
                throw new Error("User not allowed.");
            }
        }

        if (this.config.allowedEmails.length > 0) {
            const email =
                typeof payload.email === "string"
                    ? payload.email.toLowerCase()
                    : "";
            if (!email || !this.config.allowedEmails.includes(email)) {
                throw new Error("User not allowed.");
            }
        }

        return payload;
    }
}
