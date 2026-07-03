# Accessibility Notes

This app now includes its first accessibility baseline inside the real React UI:

- A skip link targets the main chat panel.
- The app uses normal landmarks instead of an application role.
- Icon-only buttons have accessible names.
- Chat messages are rendered in a live `role="log"` region.
- Focus indicators are defined globally in `src/styles.css`.
- Motion is reduced for users who prefer reduced motion.

## Manual Checks

Run the app and test:

```bash
npm run dev
```

Recommended quick pass:

- Keyboard-only: tab through servers, conversations, message composer, utilities, and dialogs.
- Screen reader: verify the skip link, active conversation names, message composer label, and new message announcements.
- Dialogs: verify Escape closes the modal and focus remains usable.

This is not full WCAG completion yet. The next accessibility pass should tighten modal focus trapping, mobile navigation behavior, and message list verbosity with NVDA and VoiceOver.
