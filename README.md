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

### WhatsApp + iMessage
- Reply to a message with a quoted preview that scrolls back to the original.
- Tapback style reactions (👍 ❤️ 😂 😮 😢 😡) with one-tap quick reactions on hover.
- Delivery and read ticks (✓ sent, ✓✓ delivered, ✓✓ blue read) on your direct messages.
- Typing indicator with simulated replies in direct conversations.
- Emoji picker in the composer.

### Discord
- Servers with text and voice channels, plus the server member list toggle in the chat header.
- Unread and @mention badges on conversations and channels, cleared when you open the chat.
- Message hover menu: reply, react, pin, copy, edit, and unsend your own messages.
- Pinned messages panel with a pin count in the chat header.
- @mention autocomplete in the composer (`@` then arrow keys and Enter).

### TeamTalk
- Joinable voice rooms from the sidebar with a "Voice connected" panel showing mute, deafen, and disconnect controls.

### Google Meet
- Server voice rooms use a Google Meet style stage: participants in a tile grid, working mic/camera/screen-share/hand-raise controls, call timer, and a copyable meeting code.
- Server voice rooms open in a three panel layout: channels on the left, people in the meet in the middle, and chat on the right.

### Skype
- Private and group chat calls use a Skype style call view with a main stage, self view corner, quality bars, round controls, and screen sharing.

### Microsoft Teams
- Calendar panel to schedule meetings and join them from the right hand utility rail.
- Notification panel fed by friend requests and mentions of you.

### Presence
- Change your own status (online, idle, do not disturb, invisible) from the user bar.

## Notes

- Chat data is stored in `localStorage` under `gsc_state_v1`.
- Use the "Reset demo data" button in the app footer when you want to reseed the local demo conversations.
- Replies, typing indicators, and voice room joins are simulated locally because there is no backend yet.
- No hosted app SDK, generated entity schemas, or platform-specific Vite plugins are used.
