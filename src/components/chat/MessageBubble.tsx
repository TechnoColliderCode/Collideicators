import { forwardRef } from "react";
import type { KeyboardEvent } from "react";
import type { Message } from "../../types";
import { formatTime } from "../../utils/date";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showSender: boolean;
  tabIndex: number;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(function MessageBubble({
  message,
  isMine,
  showSender,
  tabIndex,
  onFocus,
  onKeyDown,
}, ref) {
  const label = `${isMine ? "You" : message.senderName}, ${formatTime(message.createdAt)}. ${message.content}`;

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="message"
      className={`message-row ${isMine ? "mine" : ""}`}
      tabIndex={tabIndex}
      aria-label={label}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
    >
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
    </div>
  );
});
