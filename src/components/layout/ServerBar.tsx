import { Home, Plus } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import type { Server } from "../../types";

interface ServerBarProps {
  servers: Server[];
  activeServerId: string | null;
  onGoHome: () => void;
  onSelectServer: (serverId: string) => void;
  onCreateServer: () => void;
  onJoinServer: () => void;
}

export function ServerBar({
  servers,
  activeServerId,
  onGoHome,
  onSelectServer,
  onCreateServer,
  onJoinServer,
}: ServerBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const addWrapRef = useRef<HTMLDivElement | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement | null>(null);

  const ids = useMemo(
    () => ["home", ...servers.map((server) => server.id), "create-server"],
    [servers],
  );
  const selectedId = activeServerId ?? "home";
  const { getItemProps } = useRovingFocus({
    ids,
    selectedId,
    orientation: "horizontal",
    onActivate: (id) => {
      if (id === "home") {
        onGoHome();
      } else if (id === "create-server") {
        setMenuOpen(true);
      } else {
        onSelectServer(id);
      }
    },
  });
  const addItemProps = getItemProps("create-server");

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    firstMenuItemRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!addWrapRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        addButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <nav className="server-bar" aria-label="Servers" data-focus-target="servers">
      <button
        {...getItemProps("home")}
        type="button"
        className={`server-button ${!activeServerId ? "active" : ""}`}
        aria-label="Home and direct messages"
        aria-current={!activeServerId ? "page" : undefined}
        onClick={onGoHome}
      >
        <Home aria-hidden="true" size={18} />
      </button>
      <div className="server-divider" aria-hidden="true" />
      {servers.map((server) => (
        <button
          {...getItemProps(server.id)}
          key={server.id}
          type="button"
          className={`server-button ${activeServerId === server.id ? "active" : ""}`}
          aria-label={`Open ${server.name}`}
          aria-current={activeServerId === server.id ? "page" : undefined}
          onClick={() => onSelectServer(server.id)}
          style={{ "--server-color": server.color } as CSSProperties}
        >
          {server.name.charAt(0).toUpperCase()}
        </button>
      ))}
      <div className="server-add-wrap" ref={addWrapRef}>
        <button
          {...addItemProps}
          ref={(node) => {
            addItemProps.ref(node);
            addButtonRef.current = node;
          }}
          type="button"
          className="server-button create"
          aria-label="Add a server"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Plus aria-hidden="true" size={18} />
        </button>
        {menuOpen && (
          <div className="server-menu" role="menu" aria-label="Add a server">
            <button
              ref={firstMenuItemRef}
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onCreateServer();
              }}
            >
              Create server
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onJoinServer();
              }}
            >
              Join server
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
