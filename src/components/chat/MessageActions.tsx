import { Copy, MoreHorizontal, Pencil, Pin, PinOff, Reply, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Message } from "../../types";
import { EMOJI_SHORTCUTS } from "../../utils/emoji";

interface MessageActionsProps {
  message: Message;
  isMine: boolean;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onTogglePin: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MessageActions({
  message,
  isMine,
  onReply,
  onReact,
  onTogglePin,
  onEdit,
  onDelete,
}: MessageActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const runAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  const copyText = () => {
    void navigator.clipboard?.writeText(message.content).catch(() => undefined);
  };

  return (
    <div className={`message-actions ${menuOpen ? "open" : ""}`}>
      <div className="quick-reactions" role="group" aria-label="Quick reactions">
        {EMOJI_SHORTCUTS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="quick-reaction"
            aria-label={`React with ${emoji}`}
            onClick={() => onReact(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="menu-anchor" ref={menuRef}>
        <button
          type="button"
          className="icon-button message-menu-button"
          aria-label="More message actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MoreHorizontal aria-hidden="true" size={16} />
        </button>
        {menuOpen && (
          <div className="message-menu" role="menu">
            <button type="button" role="menuitem" onClick={() => runAction(onReply)}>
              <Reply aria-hidden="true" size={15} />
              Reply
            </button>
            <button type="button" role="menuitem" onClick={() => runAction(onTogglePin)}>
              {message.pinned ? <PinOff aria-hidden="true" size={15} /> : <Pin aria-hidden="true" size={15} />}
              {message.pinned ? "Unpin" : "Pin"}
            </button>
            <button type="button" role="menuitem" onClick={() => runAction(copyText)}>
              <Copy aria-hidden="true" size={15} />
              Copy text
            </button>
            {isMine && (
              <button type="button" role="menuitem" onClick={() => runAction(onEdit)}>
                <Pencil aria-hidden="true" size={15} />
                Edit
              </button>
            )}
            {isMine && (
              <button type="button" role="menuitem" className="danger-item" onClick={() => runAction(onDelete)}>
                <Trash2 aria-hidden="true" size={15} />
                Unsend
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
