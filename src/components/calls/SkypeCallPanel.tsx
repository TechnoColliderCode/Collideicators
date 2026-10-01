import {
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  TriangleAlert,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "../../types";
import { StreamVideo } from "./StreamVideo";

interface SkypeCallPanelProps {
  title: string;
  kind: "voice" | "video";
  participants: User[];
  currentUserId: string;
  muted: boolean;
  cameraOn: boolean;
  sharing: boolean;
  mediaError: string | null;
  cameraStream: MediaStream | null;
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

export function SkypeCallPanel({
  title,
  kind,
  participants,
  currentUserId,
  muted,
  cameraOn,
  sharing,
  mediaError,
  cameraStream,
  onToggleMute,
  onToggleCamera,
  onToggleScreen,
  onEnd,
}: SkypeCallPanelProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const me = participants.find((user) => user.id === currentUserId);
  const others = participants.filter((user) => user.id !== currentUserId);
  const primary = others[0];
  const cameraLive = cameraOn && Boolean(cameraStream);

  return (
    <section className="call-panel skype-panel" aria-labelledby="skype-call-heading">
      <header className="skype-header">
        <div>
          <h1 id="skype-call-heading">{title}</h1>
          <p className="skype-status">
            {others.length > 1 ? `${others.length + 1} people on the call` : "Connected"} · {formatDuration(elapsed)}
          </p>
        </div>
        <span className="skype-quality" title="Connection quality">
          <span className="quality-bar" aria-hidden="true" />
          <span className="quality-bar" aria-hidden="true" />
          <span className="quality-bar" aria-hidden="true" />
          <span className="sr-only">Good connection</span>
        </span>
      </header>

      <div className="skype-stage">
        <div className="skype-remote">
          {kind === "video" ? (
            <div className="skype-video-on" aria-hidden="true">
              <span className="skype-video-label">
                {primary ? `${primary.fullName.split(" ")[0]}'s camera` : "Camera"}
              </span>
            </div>
          ) : (
            <div className="avatar skype-avatar" aria-hidden="true">
              {(primary?.fullName ?? title).charAt(0).toUpperCase()}
            </div>
          )}
          <p className="skype-name">
            {others.length > 1 ? `${primary?.fullName ?? ""} +${others.length - 1}` : (primary?.fullName ?? title)}
          </p>
        </div>

        <div className="skype-self" aria-label="Your self view">
          {me && (
            <>
              {cameraLive ? (
                <StreamVideo stream={cameraStream} className="skype-self-video" label="Your camera" />
              ) : (
                <span className="avatar skype-self-avatar" aria-hidden="true">
                  {me.fullName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="skype-self-label">You{cameraLive ? "" : " (camera off)"}</span>
            </>
          )}
        </div>

        {sharing && (
          <div className="skype-share-note" role="status">
            <MonitorUp aria-hidden="true" size={16} />
            You are sharing your screen
          </div>
        )}
      </div>

      {mediaError && (
        <p className="media-warning" role="alert">
          <TriangleAlert aria-hidden="true" size={15} />
          {mediaError}
        </p>
      )}

      <div className="skype-controls" aria-label="Call controls">
        <button
          type="button"
          className={`skype-round ${muted ? "off" : ""}`}
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          aria-pressed={!muted}
          onClick={onToggleMute}
        >
          {muted ? <MicOff aria-hidden="true" size={20} /> : <Mic aria-hidden="true" size={20} />}
        </button>
        <button
          type="button"
          className={`skype-round ${cameraOn ? "" : "off"}`}
          aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
          aria-pressed={!cameraOn}
          onClick={onToggleCamera}
        >
          {cameraOn ? <Video aria-hidden="true" size={20} /> : <VideoOff aria-hidden="true" size={20} />}
        </button>
        <button
          type="button"
          className={`skype-round ${sharing ? "active" : ""}`}
          aria-label={sharing ? "Stop sharing screen" : "Share screen"}
          aria-pressed={sharing}
          onClick={onToggleScreen}
        >
          <MonitorUp aria-hidden="true" size={20} />
        </button>
        <button type="button" className="skype-round skype-end" aria-label="End call" onClick={onEnd}>
          <PhoneOff aria-hidden="true" size={20} />
        </button>
      </div>
    </section>
  );
}
