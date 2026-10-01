import {
  AtSign,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Phone,
  Pin,
  Reply,
  Send,
  Smile,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import type { Message, User } from "../../types";
import { findMentionCandidate } from "../../utils/emoji";
import type { MentionCandidate } from "../../utils/emoji";
import { EmojiPicker } from "./EmojiPicker";
import { MessageBubble } from "./MessageBubble";

interface MessageAreaProps {
  messages: Message[];
  currentUserId: string;
  chatTitle: string | null;
  chatSubtitle: string | undefined;
  participants: User[];
  replyTo: Message | null;
  typingUserName: string | null;
  showStatus: boolean;
  onSendMessage: (content: string, fileUrl?: string, replyTo?: Message | null) => void;
  onCancelReply: () => void;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onTogglePin: (messageId: string) => void;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onStartVoiceCall: () => void;
  onStartVideoCall: () => void;
  membersOpen?: boolean;
  onToggleMembers?: () => void;
}

export function MessageArea({
  messages,
  currentUserId,
  chatTitle,
  chatSubtitle,
  participants,
  replyTo,
  typingUserName,
  showStatus,
  onSendMessage,
  onCancelReply,
  onReply,
  onReact,
  onTogglePin,
  onEdit,
  onDelete,
  onStartVoiceCall,
  onStartVideoCall,
  membersOpen,
  onToggleMembers,
}: MessageAreaProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [mention, setMention] = useState<MentionCandidate | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messageIds = useMemo(() => messages.map((message) => message.id), [messages]);
  const pinned = messages.filter((message) => message.pinned);
  const { getItemProps } = useRovingFocus({
    ids: messageIds,
    selectedId: messageIds[messageIds.length - 1],
    orientation: "vertical",
    loop: false,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setMention(null);
    setMentionIndex(0);
  }, [participants]);

  const updateText = (value: string, caret: number) => {
    setText(value);
    setMention(findMentionCandidate(value, caret, participants, currentUserId));
    setMentionIndex(0);
  };

  const applyMention = (chosenUser?: User) => {
    const chosen = chosenUser
      ?? participants.find((user) => user.id === mention?.userIds[mentionIndex])
      ?? participants.find((user) => mention?.userIds.includes(user.id) ?? false);
    if (!chosen || !mention) {
      return;
    }

    const firstName = chosen.fullName.split(" ")[0];
    const next = `${text.slice(0, mention.start)}@${firstName} ${text.slice(mention.end)}`;
    setText(next);
    setMention(null);
    inputRef.current?.focus();
  };

  const send = () => {
    if (!text.trim()) {
      return;
    }
    onSendMessage(text, "", replyTo);
    setText("");
    setMention(null);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const uploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const fileUrl = URL.createObjectURL(file);
    onSendMessage(file.name, fileUrl, replyTo);
    event.target.value = "";
  };

  const insertEmoji = (emoji: string) => {
    const field = inputRef.current;
    const start = field?.selectionStart ?? text.length;
    const end = field?.selectionEnd ?? text.length;
    const next = `${text.slice(0, start)}${emoji}${text.slice(end)}`;
    setText(next);
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mention) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setMentionIndex((index) => (index + 1) % mention.userIds.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setMentionIndex((index) => (index - 1 + mention.userIds.length) % mention.userIds.length);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        applyMention();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setMention(null);
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const mentionUsers = (mention?.userIds ?? [])
    .map((id) => participants.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user));

  return (
    <section className="message-panel" aria-labelledby="chat-heading">
      <header className="chat-header">
        <div className="chat-heading-group">
          <div className="avatar large" aria-hidden="true">
            {chatTitle?.charAt(0).replace("#", "").toUpperCase() || "?"}
          </div>
          <div>
            <h1 id="chat-heading">{chatTitle || "Select a chat"}</h1>
            {chatSubtitle && <p>{chatSubtitle}</p>}
          </div>
        </div>
        {chatTitle && (
          <div className="toolbar" aria-label="Chat actions">
            <button
              type="button"
              className={`icon-button ${showPins ? "active-tool" : ""}`}
              aria-label={`Pinned messages (${pinned.length})`}
              aria-pressed={showPins}
              onClick={() => setShowPins((open) => !open)}
            >
              <Pin aria-hidden="true" size={17} />
              {pinned.length > 0 && <span className="badge">{pinned.length}</span>}
            </button>
            <button type="button" className="icon-button" aria-label="Start voice call" onClick={onStartVoiceCall}>
              <Phone aria-hidden="true" size={17} />
            </button>
            <button type="button" className="icon-button" aria-label="Start video call" onClick={onStartVideoCall}>
              <Video aria-hidden="true" size={17} />
            </button>
            {onToggleMembers && (
              <button
                type="button"
                className={`icon-button ${membersOpen ? "active-tool" : ""}`}
                aria-label="Toggle server member list"
                aria-pressed={Boolean(membersOpen)}
                onClick={onToggleMembers}
              >
                <Users aria-hidden="true" size={17} />
              </button>
            )}
            <button type="button" className="icon-button" aria-label="More chat actions">
              <MoreVertical aria-hidden="true" size={17} />
            </button>
          </div>
        )}
      </header>

      {showPins && (
        <div className="pins-panel" role="region" aria-label="Pinned messages">
          <header>
            <h2>Pinned messages</h2>
            <button type="button" className="icon-button" aria-label="Close pinned messages" onClick={() => setShowPins(false)}>
              <X aria-hidden="true" size={16} />
            </button>
          </header>
          {pinned.length === 0 ? (
            <p className="empty-note pins-empty">Nothing pinned here yet.</p>
          ) : (
            pinned.map((message) => (
              <article key={message.id} className="pin-item">
                <strong>{message.senderName}</strong>
                <p>{message.content}</p>
                <button type="button" onClick={() => onTogglePin(message.id)}>Unpin</button>
              </article>
            ))
          )}
        </div>
      )}

      <div
        className="message-list"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-atomic="false"
        aria-label={chatTitle ? `${chatTitle} messages` : "Messages"}
        aria-describedby={messages.length > 0 ? "message-list-help" : undefined}
        tabIndex={messages.length === 0 ? 0 : undefined}
        data-focus-target="messages"
      >
        {messages.length > 0 && (
          <p id="message-list-help" className="sr-only">
            Use Up and Down Arrow to move between messages. Press End for the newest message.
          </p>
        )}
        {!chatTitle ? (
          <div className="empty-state">
            <MessageCircle aria-hidden="true" size={42} />
            <p>Choose a conversation or channel to start chatting.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <MessageCircle aria-hidden="true" size={42} />
            <p>No messages yet. Say hello.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1];
            return (
              <MessageBubble
                {...getItemProps(message.id)}
                key={message.id}
                message={message}
                users={participants}
                currentUserId={currentUserId}
                isMine={message.senderId === currentUserId}
                showSender={!previous || previous.senderId !== message.senderId}
                showStatus={showStatus && message.senderId === currentUserId}
                now={now}
                onReply={onReply}
                onReact={onReact}
                onTogglePin={onTogglePin}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {typingUserName && (
        <p className="typing-indicator" role="status">
          <span className="typing-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {typingUserName} is typing…
        </p>
      )}

      {chatTitle && (
        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          {replyTo && (
            <div className="reply-bar">
              <Reply aria-hidden="true" size={14} />
              <span>
                Replying to <strong>{replyTo.senderId === currentUserId ? "yourself" : replyTo.senderName}</strong>
              </span>
              <button type="button" className="icon-button" aria-label="Cancel reply" onClick={onCancelReply}>
                <X aria-hidden="true" size={14} />
              </button>
            </div>
          )}

          {mention && mentionUsers.length > 0 && (
            <div className="mention-menu" role="listbox" aria-label="Mention suggestions">
              {mentionUsers.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  role="option"
                  aria-selected={index === mentionIndex}
                  className={index === mentionIndex ? "highlighted" : ""}
                  onMouseEnter={() => setMentionIndex(index)}
                  onClick={() => applyMention(user)}
                >
                  <span className="avatar small" aria-hidden="true">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.fullName}</span>
                </button>
              ))}
            </div>
          )}

          <label className="file-button">
            <span className="sr-only">Attach an image</span>
            <Paperclip aria-hidden="true" size={18} />
            <input type="file" accept="image/*" onChange={uploadFile} />
          </label>

          <div className="composer-input">
            <div className="composer-tools">
              <button
                type="button"
                className={`icon-button ${showEmoji ? "active-tool" : ""}`}
                aria-label="Toggle emoji picker"
                aria-expanded={showEmoji}
                onClick={() => setShowEmoji((open) => !open)}
              >
                <Smile aria-hidden="true" size={18} />
              </button>
              <span className="composer-hint" aria-hidden="true">
                <AtSign size={13} /> to mention people
              </span>
            </div>
            <label className="sr-only" htmlFor="message-composer">
              Message {chatTitle}
            </label>
            <textarea
              id="message-composer"
              ref={inputRef}
              value={text}
              onChange={(event) => updateText(event.target.value, event.target.selectionStart ?? event.target.value.length)}
              onKeyDown={handleComposerKeyDown}
              rows={1}
              placeholder={`Message ${chatTitle}`}
              data-focus-target="composer"
            />
          </div>

          <button type="submit" className="send-button" disabled={!text.trim()} aria-label="Send message">
            <Send aria-hidden="true" size={18} />
          </button>

          {showEmoji && <EmojiPicker onPick={insertEmoji} onClose={() => setShowEmoji(false)} />}
        </form>
      )}
    </section>
  );
}
