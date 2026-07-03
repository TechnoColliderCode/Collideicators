# Galaxia Star Communicators
A Mashup Of All Chatting Apps (Discord, TeamTalk, Imessage, Whatsapp, google meet and Microsoft Teams)

This is a normal Vite, React, and TypeScript chat app. The current development build uses local browser storage so the interface can run without a hosted backend while the real server plan is decided.

## Local Setup

```bash
npm install --package-lock=false
npm run dev
```

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Notes

- Chat data is stored in `localStorage` under `gsc_state_v1`.
- Use the "Reset demo data" button in the app footer when you want to reseed the local demo conversations.
- No hosted app SDK, generated entity schemas, or platform-specific Vite plugins are used.
