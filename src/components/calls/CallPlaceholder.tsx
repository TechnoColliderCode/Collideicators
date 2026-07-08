import { LogOut, Mic, Phone, Video } from "lucide-react";

interface CallPlaceholderProps {
  title: string;
  onEnd: () => void;
}

export function CallPlaceholder({ title, onEnd }: CallPlaceholderProps) {
  return (
    <section className="call-panel" aria-labelledby="call-heading">
      <header className="chat-header">
        <div className="chat-heading-group">
          <Phone aria-hidden="true" size={20} />
          <h1 id="call-heading">{title} call</h1>
        </div>
      </header>
      <div className="call-stage">
        <div className="avatar call-avatar" aria-hidden="true">
          {title.charAt(0).replace("#", "").toUpperCase()}
        </div>
        <p>Calls are a placeholder in this local TypeScript build.</p>
      </div>
      <div className="call-controls" aria-label="Call controls">
        <button type="button" className="icon-button" aria-label="Toggle microphone">
          <Mic aria-hidden="true" size={18} />
        </button>
        <button type="button" className="icon-button" aria-label="Toggle camera">
          <Video aria-hidden="true" size={18} />
        </button>
        <button type="button" className="end-call" onClick={onEnd}>
          <LogOut aria-hidden="true" size={18} />
          End call
        </button>
      </div>
    </section>
  );
}
