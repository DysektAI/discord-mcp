import assert from "node:assert/strict";
import test from "node:test";
import { McpAuthManager } from "./McpAuthManager.js";

function buildManager() {
    return new McpAuthManager({
        mode: "mixed",
        staticBearerToken: "secret",
        oauthEnabled: false,
        authorizationServers: [],
        scopesSupported: [],
        requiredScopes: [],
        allowedUserIds: [],
        allowedEmails: [],
        consentPath: "/oauth/consent",
    });
}

test("McpAuthManager defaults mixed auth to tools/call only", () => {
    const manager = buildManager();

    assert.equal(manager.shouldAuthenticateJsonRpcMethod("initialize"), false);
    assert.equal(manager.shouldAuthenticateJsonRpcMethod("tools/list"), false);
    assert.equal(manager.shouldAuthenticateJsonRpcMethod("tools/call"), true);
    assert.equal(manager.shouldAuthenticateTransport(), false);
});

test("McpAuthManager validates static bearer tokens", async () => {
    const manager = buildManager();
    const rawUrl = "https://mcp.example.com/";

    const missing = await manager.authenticate(
        new Headers({ host: "mcp.example.com" }),
        rawUrl,
    );
    assert.equal("status" in missing ? missing.status : 200, 401);

    const valid = await manager.authenticate(
        new Headers({
            host: "mcp.example.com",
            authorization: "Bearer secret",
        }),
        rawUrl,
    );
    assert.equal("status" in valid ? valid.status : 200, 200);
});

test("McpAuthManager builds protected resource metadata", () => {
    const manager = new McpAuthManager({
        mode: "mixed",
        oauthEnabled: true,
        issuer: "https://issuer.example.com",
        jwksUrl: "https://issuer.example.com/.well-known/jwks.json",
        resource: "https://mcp.example.com",
        authorizationServers: [],
        scopesSupported: ["mcp:all"],
        requiredScopes: ["mcp:all"],
        allowedUserIds: [],
        allowedEmails: [],
        consentPath: "/oauth/consent",
    });

    const metadata = manager.buildProtectedResourceMetadata(
        new Headers({ host: "ignored.example.com" }),
        "https://ignored.example.com/",
    );

    assert.deepEqual(metadata, {
        resource: "https://mcp.example.com",
        authorization_servers: ["https://issuer.example.com"],
        scopes_supported: ["mcp:all"],
        resource_documentation: undefined,
        bearer_methods_supported: ["header"],
    });
});
