import {
  Copy,
  Hand,
  LogOut,
  Mic,
  MicOff,
  MonitorUp,
  TriangleAlert,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "../../types";
import { StreamVideo } from "./StreamVideo";

interface CallPanelProps {
  title: string;
  kind: "voice" | "video";
  participants: User[];
  currentUserId: string;
  muted: boolean;
  cameraOn: boolean;
  sharing: boolean;
  speaking: boolean;
  mediaError: string | null;
  cameraStream: MediaStream | null;
  screenStream: MediaStream | null;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreen: () => void;
  onEnd: () => void;
}

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export function CallPanel({
  title,
  kind,
  participants,
  currentUserId,
  muted,
  cameraOn,
  sharing,
  speaking,
  mediaError,
  cameraStream,
  screenStream,
  onToggleMute,
  onToggleCamera,
  onToggleScreen,
  onEnd,
}: CallPanelProps) {
  const [handRaised, setHandRaised] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const meetingCode = `gsc-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "call"}`;

  const copyLink = () => {
    void navigator.clipboard
      ?.writeText(`https://galaxia.chat/${meetingCode}`)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => undefined);
  };

  const others = participants.filter((user) => user.id !== currentUserId);
  const me = participants.find((user) => user.id === currentUserId);
  const cameraLive = cameraOn && Boolean(cameraStream);

  return (
    <section className="call-panel meet-panel" aria-labelledby="call-heading">
      <header className="chat-header">
        <div className="chat-heading-group">
          <div>
            <h1 id="call-heading">{title}</h1>
            <p>
              {kind === "video" ? "Video call" : "Voice call"} · {others.length + 1} in call ·{" "}
              {formatDuration(elapsed)}
            </p>
          </div>
        </div>
        <div className="toolbar" aria-label="Meeting link">
          <button type="button" className="meet-link" onClick={copyLink}>
            <Copy aria-hidden="true" size={14} />
            {copied ? "Copied" : meetingCode}
          </button>
        </div>
      </header>

      <div className="call-stage meet-grid" aria-label="Participants">
        {sharing && me && (
          <div className="participant-tile presenting">
            {screenStream ? (
              <StreamVideo stream={screenStream} className="tile-video" label="Your shared screen" />
            ) : (
              <div className="screen-preview" aria-hidden="true">
                <MonitorUp size={34} />
              </div>
            )}
            <span className="tile-name">You are presenting</span>
          </div>
        )}

        {others.map((user) => (
          <div key={user.id} className="participant-tile">
            <div className="avatar call-avatar" aria-hidden="true">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <span className="tile-name">
              {user.fullName}
              {user.status === "offline" && " (offline)"}
            </span>
            <span className="tile-status" aria-hidden="true">
              <Mic size={13} />
            </span>
          </div>
        ))}

        {me && (
          <div
            className={`participant-tile ${cameraLive ? "has-video" : "camera-off"} ${
              speaking ? "speaking" : ""
            }`}
          >
            {cameraLive ? (
              <StreamVideo stream={cameraStream} className="tile-video" label="Your camera" />
            ) : (
              <div className="avatar call-avatar" aria-hidden="true">
                {me.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="tile-name">You</span>
            <span className="tile-status" aria-hidden="true">
              {muted ? <MicOff size={13} className="muted-icon" /> : <Mic size={13} />}
              {handRaised && <Hand size={13} className="hand-icon" />}
            </span>
          </div>
        )}
      </div>

      {mediaError && (
        <p className="media-warning" role="alert">
          <TriangleAlert aria-hidden="true" size={15} />
          {mediaError}
        </p>
      )}

      <div className="call-controls" aria-label="Call controls">
        <button
          type="button"
          className={`icon-button ${muted ? "danger" : ""}`}
          aria-label={muted ? "Turn microphone on" : "Turn microphone off"}
          aria-pressed={!muted}
          onClick={onToggleMute}
        >
          {muted ? <MicOff aria-hidden="true" size={18} /> : <Mic aria-hidden="true" size={18} />}
        </button>
        <button
          type="button"
          className={`icon-button ${cameraOn ? "" : "danger"}`}
          aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
          aria-pressed={!cameraOn}
          onClick={onToggleCamera}
        >
          {cameraOn ? <Video aria-hidden="true" size={18} /> : <VideoOff aria-hidden="true" size={18} />}
        </button>
        <button
          type="button"
          className={`icon-button ${sharing ? "active-tool" : ""}`}
          aria-label={sharing ? "Stop sharing screen" : "Share screen"}
          aria-pressed={sharing}
          onClick={onToggleScreen}
        >
          <MonitorUp aria-hidden="true" size={18} />
        </button>
        <button
          type="button"
          className={`icon-button ${handRaised ? "active-tool" : ""}`}
          aria-label={handRaised ? "Lower hand" : "Raise hand"}
          aria-pressed={handRaised}
          onClick={() => setHandRaised((value) => !value)}
        >
          <Hand aria-hidden="true" size={18} />
        </button>
        <button type="button" className="end-call" onClick={onEnd}>
          <LogOut aria-hidden="true" size={18} />
          Leave call
        </button>
      </div>
    </section>
  );
}
