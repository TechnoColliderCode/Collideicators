import { Headphones, Mic, MicOff, Settings } from "lucide-react";
import { useState } from "react";
import type { User } from "../../types";

export function UserBar({ user }: { user: User }) {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);

  return (
    <div className="user-bar">
      <div className="avatar status-avatar" aria-hidden="true">
        {user.fullName.charAt(0).toUpperCase()}
        <span className={`presence ${user.status}`} />
      </div>
      <div className="user-copy">
        <p>{user.fullName}</p>
        <span>{user.email}</span>
      </div>
      <button
        type="button"
        className={`icon-button ${muted ? "danger" : ""}`}
        aria-label={muted ? "Unmute microphone" : "Mute microphone"}
        aria-pressed={muted}
        onClick={() => setMuted((value) => !value)}
      >
        {muted ? <MicOff aria-hidden="true" size={16} /> : <Mic aria-hidden="true" size={16} />}
      </button>
      <button
        type="button"
        className={`icon-button ${deafened ? "danger" : ""}`}
        aria-label={deafened ? "Undeafen audio" : "Deafen audio"}
        aria-pressed={deafened}
        onClick={() => setDeafened((value) => !value)}
      >
        <Headphones aria-hidden="true" size={16} />
      </button>
      <button type="button" className="icon-button" aria-label="Open settings">
        <Settings aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
