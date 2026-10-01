# Collideicators
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

## Features

Borrowed from the apps this project mashes together:

### Discord
- Discord styled authentication: a "Welcome back!" login screen and a "Create an account" register screen, local sessions, and log out from the account menu in the user bar.
- Servers with a server member list toggle in the chat header.
- Unread and @mention badges on conversations and channels, cleared when you open the chat.
- Message hover menu: reply, react, pin, copy, edit, and unsend your own messages.
- Pinned messages panel with a pin count in the chat header.
- @mention autocomplete in the composer (`@` then arrow keys and Enter).

### TeamTalk
- Every channel is a voice calling channel, TeamTalk5 style: there are no text only channels, clicking a channel joins its voice room.
- A "Voice connected" panel in the sidebar with mute, deafen, and disconnect controls.

### Google Meet
- Server voice rooms use a Google Meet style stage: participants in a tile grid, working mic/camera/screen-share/hand-raise controls, call timer, and a copyable meeting code.
- Server voice rooms open in a three panel layout: channels on the left, people in the meet in the middle, and chat on the right.

### Skype
- Private and group chat calls use a Skype style call view with a main stage, self view corner, quality bars, round controls, and screen sharing.

### Microsoft Teams
- Calendar panel to schedule meetings and join them from the right hand utility rail.
- Notification panel fed by friend requests and mentions of you.

### WhatsApp + iMessage
- Reply to a message with a quoted preview that scrolls back to the original.
- Tapback style reactions (👍 ❤️ 😂 😮 😢 😡) with one-tap quick reactions on hover.
- Delivery and read ticks (✓ sent, ✓✓ delivered, ✓✓ blue read) on your direct messages.
- Typing indicator with simulated replies in direct conversations.
- Emoji picker in the composer.

### Presence
- Change your own status (online, idle, do not disturb, invisible) from the account menu.

## Authentication

- There are no demo accounts. Register a new account on the "Create an account" screen and log in with it.
- The seeded people (Alex, Jordan, Sam, Morgan) are chat partners only and cannot be logged into.
- Registering adds you to the Galaxia Lobby server, where you can join the voice channels right away.
- Passwords are stored only as a local hash in `localStorage` on this device. This is a stand in until a real backend exists, not production grade auth.

## Notes

- Chat data is stored in `localStorage` under `gsc_state_v1`.
- The session (who you are logged in as) is part of the same stored state and survives reloads until you log out.
- Use the "Reset demo data" button on the login screen or in the app footer when you want to reseed the local demo conversations.
- Replies, typing indicators, and voice room joins are simulated locally because there is no backend yet.
- No hosted app SDK, generated entity schemas, or platform-specific Vite plugins are used.
