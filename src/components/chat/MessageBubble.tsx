import { Check, CheckCheck } from "lucide-react";
import { forwardRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Message, MessageStatus, User } from "../../types";
import { deriveMessageStatus } from "../../utils/chat";
import { formatTime } from "../../utils/date";
import { MessageActions } from "./MessageActions";
import { MessageText } from "./MessageText";

interface MessageBubbleProps {
  message: Message;
  users: User[];
  currentUserId: string;
  isMine: boolean;
  showSender: boolean;
  showStatus: boolean;
  now: number;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onTogglePin: (messageId: string) => void;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  tabIndex: number;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

const statusLabel: Record<MessageStatus, string> = {
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
};

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(function MessageBubble({
  message,
  users,
  currentUserId,
  isMine,
  showSender,
  showStatus,
  now,
  onReply,
  onReact,
  onTogglePin,
  onEdit,
  onDelete,
  tabIndex,
  onFocus,
  onKeyDown,
}, ref) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const status = deriveMessageStatus(message.createdAt, now);
  const label = message.unsent
    ? `${isMine ? "You" : message.senderName} unsent a message.`
    : `${isMine ? "You" : message.senderName}, ${formatTime(message.createdAt)}. ${message.content}`;

  const groupedReactions = message.reactions.reduce<Record<string, string[]>>((acc, reaction) => {
    acc[reaction.emoji] = [...(acc[reaction.emoji] ?? []), reaction.userId];
    return acc;
  }, {});

  const scrollToQuoted = () => {
    if (!message.replyTo) {
      return;
    }
    const original = document.getElementById(`message-${message.replyTo.messageId}`);
    original?.scrollIntoView({ block: "center", behavior: "smooth" });
    original?.focus();
  };

  const saveEdit = () => {
    if (draft.trim() && draft.trim() !== message.content) {
      onEdit(message.id, draft.trim());
    }
    setEditing(false);
  };

  return (
    <div
      ref={ref}
      id={`message-${message.id}`}
      role="group"
      aria-roledescription="message"
      className={`message-row ${isMine ? "mine" : ""} ${message.pinned ? "pinned" : ""}`}
      tabIndex={tabIndex}
      aria-label={label}
      onFocus={onFocus}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }
        onKeyDown(event);
      }}
    >
      <div className="message-stack">
        {showSender && !isMine && <p className="message-sender">{message.senderName}</p>}
        <div className="message-bubble">
          {message.replyTo && (
            <button type="button" className="reply-quote" onClick={scrollToQuoted}>
              <span className="reply-author">{message.replyTo.senderName}</span>
              <span className="reply-content">{message.replyTo.content}</span>
            </button>
          )}
          {message.type === "image" && message.fileUrl && (
            <img src={message.fileUrl} alt={`Attachment from ${message.senderName}`} />
          )}
          {message.unsent ? (
            <p className="unsent-note">Message unsent</p>
          ) : editing ? (
            <span className="inline-editor">
              <textarea
                value={draft}
                aria-label="Edit message"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    saveEdit();
                  }
                  if (event.key === "Escape") {
                    setEditing(false);
                    setDraft(message.content);
                  }
                }}
                rows={2}
                autoFocus
              />
              <span className="editor-hint">Enter to save, Esc to cancel</span>
            </span>
          ) : (
            <p>
              <MessageText content={message.content} users={users} />
              {message.editedAt && <span className="edited-tag">(edited)</span>}
            </p>
          )}
        </div>

        {Object.keys(groupedReactions).length > 0 && (
          <div className="reaction-row" role="group" aria-label="Message reactions">
            {Object.entries(groupedReactions).map(([emoji, userIds]) => {
              const mine = userIds.includes(currentUserId);
              const names = userIds
                .map((id) => (id === currentUserId ? "You" : users.find((user) => user.id === id)?.fullName ?? "Someone"))
                .join(", ");
              return (
                <button
                  key={emoji}
                  type="button"
                  className={`reaction-chip ${mine ? "mine" : ""}`}
                  aria-pressed={mine}
                  aria-label={`${emoji}, reacted by ${names}`}
                  onClick={() => onReact(message.id, emoji)}
                >
                  <span aria-hidden="true">{emoji}</span>
                  {userIds.length > 1 && <span className="reaction-count">{userIds.length}</span>}
                </button>
              );
            })}
          </div>
        )}

        <div className="message-meta">
          <time dateTime={message.createdAt}>
            {formatTime(message.createdAt)}
            {message.pinned && <span className="pin-flag"> · pinned</span>}
          </time>
          {showStatus && !message.unsent && (
            <span className={`message-status ${status}`} aria-label={statusLabel[status]}>
              {status === "sent" ? (
                <Check aria-hidden="true" size={13} />
              ) : (
                <CheckCheck aria-hidden="true" size={13} />
              )}
            </span>
          )}
        </div>

        {!message.unsent && !editing && (
          <MessageActions
            message={message}
            isMine={isMine}
            onReply={() => onReply(message)}
            onReact={(emoji) => onReact(message.id, emoji)}
            onTogglePin={() => onTogglePin(message.id)}
            onEdit={() => {
              setDraft(message.content);
              setEditing(true);
            }}
            onDelete={() => onDelete(message.id)}
          />
        )}
      </div>
    </div>
  );
});
