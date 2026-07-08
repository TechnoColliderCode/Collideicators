import {
  MessageCircle,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import type { Message } from "../../types";
import { MessageBubble } from "./MessageBubble";

interface MessageAreaProps {
  messages: Message[];
  currentUserId: string;
  chatTitle: string | null;
  chatSubtitle: string | undefined;
  onSendMessage: (content: string, fileUrl?: string) => void;
  onStartVoiceCall: () => void;
}

export function MessageArea({
  messages,
  currentUserId,
  chatTitle,
  chatSubtitle,
  onSendMessage,
  onStartVoiceCall,
}: MessageAreaProps) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messageIds = useMemo(() => messages.map((message) => message.id), [messages]);
  const { getItemProps } = useRovingFocus({
    ids: messageIds,
    selectedId: messageIds[messageIds.length - 1],
    orientation: "vertical",
    loop: false,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const send = () => {
    if (!text.trim()) {
      return;
    }
    onSendMessage(text);
    setText("");
    inputRef.current?.focus();
  };

  const uploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const fileUrl = URL.createObjectURL(file);
    onSendMessage(file.name, fileUrl);
    event.target.value = "";
  };

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
            <button type="button" className="icon-button" aria-label="Start voice call" onClick={onStartVoiceCall}>
              <Phone aria-hidden="true" size={17} />
            </button>
            <button type="button" className="icon-button" aria-label="Start video call" onClick={onStartVoiceCall}>
              <Video aria-hidden="true" size={17} />
            </button>
            <button type="button" className="icon-button" aria-label="More chat actions">
              <MoreVertical aria-hidden="true" size={17} />
            </button>
          </div>
        )}
      </header>

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
                isMine={message.senderId === currentUserId}
                showSender={!previous || previous.senderId !== message.senderId}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {chatTitle && (
        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <label className="file-button">
            <span className="sr-only">Attach an image</span>
            <Paperclip aria-hidden="true" size={18} />
            <input type="file" accept="image/*" onChange={uploadFile} />
          </label>
          <label className="sr-only" htmlFor="message-composer">
            Message {chatTitle}
          </label>
          <textarea
            id="message-composer"
            ref={inputRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={`Message ${chatTitle}`}
            data-focus-target="composer"
          />
          <button type="submit" className="send-button" disabled={!text.trim()} aria-label="Send message">
            <Send aria-hidden="true" size={18} />
          </button>
        </form>
      )}
    </section>
  );
}
