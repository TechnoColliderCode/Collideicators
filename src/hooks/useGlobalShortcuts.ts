import { useEffect } from "react";

interface ShortcutTargets {
  onFocusServers: () => void;
  onFocusSidebar: () => void;
  onFocusMessages: () => void;
  onFocusComposer: () => void;
  onFocusUtilities: () => void;
}

const isEditableElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};

export function useGlobalShortcuts({
  onFocusServers,
  onFocusSidebar,
  onFocusMessages,
  onFocusComposer,
  onFocusUtilities,
}: ShortcutTargets) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.altKey || isEditableElement(event.target)) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "1":
          event.preventDefault();
          onFocusServers();
          break;
        case "2":
          event.preventDefault();
          onFocusSidebar();
          break;
        case "3":
          event.preventDefault();
          onFocusMessages();
          break;
        case "4":
          event.preventDefault();
          onFocusUtilities();
          break;
        case "m":
          event.preventDefault();
          onFocusComposer();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onFocusComposer, onFocusMessages, onFocusServers, onFocusSidebar, onFocusUtilities]);
}
