import { Home, Plus } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import type { Server } from "../../types";

interface ServerBarProps {
  servers: Server[];
  activeServerId: string | null;
  onGoHome: () => void;
  onSelectServer: (serverId: string) => void;
  onCreateServer: () => void;
}

export function ServerBar({
  servers,
  activeServerId,
  onGoHome,
  onSelectServer,
  onCreateServer,
}: ServerBarProps) {
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
        onCreateServer();
      } else {
        onSelectServer(id);
      }
    },
  });

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
      <button
        {...getItemProps("create-server")}
        type="button"
        className="server-button create"
        aria-label="Create server"
        aria-haspopup="dialog"
        onClick={onCreateServer}
      >
        <Plus aria-hidden="true" size={18} />
      </button>
    </nav>
  );
}
