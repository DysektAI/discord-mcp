# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the TypeScript source. Core orchestration lives in `src/core/`, Discord API wrappers in `src/services/discord/`, tool definitions/handlers in `src/tools/`, and shared schemas in `src/types/`.
- Generated output goes to `dist/` (built artifacts consumed by `node dist/index.js`).
- Docs and references live in `docs/`, with architecture notes in `docs/architecture.md`.
- Assets such as logos are under `assets/`.

## Build, Test, and Development Commands
- `npm run dev`: run the MCP server from source with `tsx` for local development.
- `npm run build`: compile TypeScript to `dist/` (required before `npm start`).
- `npm start`: run the built server from `dist/index.js`.
- `node test-build.js`: quick smoke check that build outputs and key deps exist.
- `./scripts/build.sh`: clean + build + copy packaging files (useful for release packaging).

## Coding Style & Naming Conventions
- TypeScript in ESM mode (`"type": "module"`) with `strict` enabled; keep types explicit and avoid `any`.
- Follow existing formatting: 2-space indentation, trailing commas, and organized imports.
- Naming pattern examples: `DiscordController.ts` (PascalCase class files), tool files like `src/tools/definitions/private-messages.ts` (kebab-case).
- Keep API-facing tool/action names consistent with existing definitions in `src/tools/definitions/`.

## Testing Guidelines
- Unit tests live in `src/core/__tests__/` and use Jest-style APIs, but tests are currently excluded from `tsconfig.json`.
- There is no `npm test` script; treat `npm run build` and `npm run dev` as the default checks unless you add a runner.
- Validate changes with a real Discord bot in a test server, especially for permission or rate-limit behavior.

## Commit & Pull Request Guidelines
- Recent history shows short, imperative, sentence-case messages (e.g., “Refactor code structure…”), plus standard GitHub merge commits. Keep messages concise and action-oriented.
- Contributing docs recommend conventional prefixes like `feat:` for new features; use them if you follow that style.
- PRs should include a clear description, testing notes, and must pass `npm run build`. Never include secrets.

## Security & Configuration Notes
- Configure secrets via `.env` (`DISCORD_TOKEN`, optional `DISCORD_GUILD_ID`). Never commit tokens.
- Review `SECURITY.md` before submitting changes that touch auth, permissions, or token handling.
