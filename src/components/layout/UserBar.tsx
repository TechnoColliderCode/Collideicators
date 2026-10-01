import { ChevronDown, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PresenceStatus, User } from "../../types";

interface UserBarProps {
  user: User;
  onStatusChange: (status: PresenceStatus) => void;
}

const STATUS_OPTIONS: { id: PresenceStatus; label: string }[] = [
  { id: "online", label: "Online" },
  { id: "idle", label: "Idle" },
  { id: "dnd", label: "Do not disturb" },
  { id: "offline", label: "Invisible" },
];

export function UserBar({ user, onStatusChange }: UserBarProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="user-bar" ref={containerRef}>
      <button
        type="button"
        className="status-trigger"
        aria-label={`Change status. Current status: ${user.status}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="avatar status-avatar" aria-hidden="true">
          {user.fullName.charAt(0).toUpperCase()}
          <span className={`presence ${user.status}`} />
        </span>
        <span className="user-copy">
          <p>{user.fullName}</p>
          <span>{user.email}</span>
        </span>
        <ChevronDown aria-hidden="true" size={14} />
      </button>

      {open && (
        <div className="status-menu" role="menu" aria-label="Set your status">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={user.status === option.id}
              className={user.status === option.id ? "selected" : ""}
              onClick={() => {
                onStatusChange(option.id);
                setOpen(false);
              }}
            >
              <span className={`presence ${option.id}`} aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>
      )}

      <button type="button" className="icon-button" aria-label="Open settings">
        <Settings aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
