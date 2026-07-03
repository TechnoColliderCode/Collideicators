# AGENTS.md

## Project Context

This is a normal Vite, React, and TypeScript chat application. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup and development commands.

## Key Files

- `src/`: application source.
- `src/App.tsx`: main chat shell and current local UI composition.
- `src/data/localStore.ts`: temporary local browser storage data layer.
- `src/types.ts`: shared TypeScript model types.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `npm run dev` for local development.
- Run the relevant checks from `package.json` before finishing code changes.
- The current data layer is intentionally local-only. Replace it with a real backend service when messaging needs to work across devices/users.
- Preserve accessibility basics: semantic landmarks, labelled icon buttons, visible focus, and live announcements for dynamic chat updates.
