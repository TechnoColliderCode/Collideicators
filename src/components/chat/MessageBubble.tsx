import type { Message } from "../../types";
import { formatTime } from "../../utils/date";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showSender: boolean;
}

export function MessageBubble({ message, isMine, showSender }: MessageBubbleProps) {
  return (
    <article className={`message-row ${isMine ? "mine" : ""}`}>
      <div className="message-stack">
        {showSender && !isMine && <p className="message-sender">{message.senderName}</p>}
        <div className="message-bubble">
          {message.type === "image" && message.fileUrl && (
            <img src={message.fileUrl} alt={`Attachment from ${message.senderName}`} />
          )}
          <p>{message.content}</p>
        </div>
        <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
      </div>
    </article>
  );
}
