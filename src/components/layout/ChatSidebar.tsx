import { Hash, Headphones, Plus, Search, UserPlus, Users } from "lucide-react";
import { useMemo } from "react";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import type { Channel, Conversation, User } from "../../types";
import { getConversationName } from "../../utils/conversation";
import { relativeTime } from "../../utils/date";
import { UserBar } from "./UserBar";

interface ChatSidebarProps {
  mode: "server" | "dm";
  conversations: Conversation[];
  channels: Channel[];
  activeId: string | null;
  currentUser: User;
  searchQuery: string;
  serverName: string;
  showFriends: boolean;
  onSearchChange: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onSelectChannel: (channelId: string) => void;
  onShowFriends: () => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  mode,
  conversations,
  channels,
  activeId,
  currentUser,
  searchQuery,
  serverName,
  showFriends,
  onSearchChange,
  onSelectConversation,
  onSelectChannel,
  onShowFriends,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <aside className="chat-sidebar" aria-label={mode === "server" ? "Server channels" : "Direct messages"}>
      <UserBar user={currentUser} />
      <div className="sidebar-header">
        {mode === "server" ? (
          <h2>{serverName || "Server"}</h2>
        ) : (
          <button
            type="button"
            className={`wide-action ${showFriends ? "selected" : ""}`}
            aria-pressed={showFriends}
            onClick={onShowFriends}
          >
            <UserPlus aria-hidden="true" size={16} />
            Friends
          </button>
        )}
        <label className="search-field">
          <span className="sr-only">Search {mode === "server" ? "channels" : "conversations"}</span>
          <Search aria-hidden="true" size={14} />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search"
          />
        </label>
      </div>

      <div className="sidebar-list">
        {mode === "server" ? (
          <ChannelList
            channels={channels}
            activeId={activeId}
            onSelectChannel={onSelectChannel}
          />
        ) : (
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            currentUser={currentUser}
            onSelectConversation={onSelectConversation}
            onNewChat={onNewChat}
          />
        )}
      </div>
    </aside>
  );
}

function ChannelList({
  channels,
  activeId,
  onSelectChannel,
}: {
  channels: Channel[];
  activeId: string | null;
  onSelectChannel: (channelId: string) => void;
}) {
  const ids = useMemo(() => channels.map((channel) => channel.id), [channels]);
  const { getItemProps } = useRovingFocus({
    ids,
    selectedId: activeId,
    orientation: "vertical",
    onActivate: onSelectChannel,
  });

  return (
    <section aria-labelledby="channels-heading" data-focus-target="sidebar">
      <h3 id="channels-heading" className="section-label">
        Channels
      </h3>
      <p id="channels-help" className="sr-only">
        Use Up and Down Arrow to move between channels. Press Enter to open the focused channel.
      </p>
      {channels.map((channel) => (
        <button
          {...getItemProps(channel.id)}
          key={channel.id}
          type="button"
          className={`list-item ${activeId === channel.id ? "selected" : ""}`}
          aria-current={activeId === channel.id ? "page" : undefined}
          aria-describedby="channels-help"
          onClick={() => onSelectChannel(channel.id)}
        >
          {channel.type === "voice" ? (
            <Headphones aria-hidden="true" size={16} />
          ) : (
            <Hash aria-hidden="true" size={16} />
          )}
          <span>{channel.name}</span>
          {channel.type === "voice" && (
            <span className="meta">
              {channel.participantCount}/{channel.maxParticipants}
            </span>
          )}
        </button>
      ))}
    </section>
  );
}

function ConversationList({
  conversations,
  activeId,
  currentUser,
  onSelectConversation,
  onNewChat,
}: {
  conversations: Conversation[];
  activeId: string | null;
  currentUser: User;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
}) {
  const ids = useMemo(() => conversations.map((conversation) => conversation.id), [conversations]);
  const { getItemProps } = useRovingFocus({
    ids,
    selectedId: activeId,
    orientation: "vertical",
    onActivate: onSelectConversation,
  });

  return (
    <section aria-labelledby="conversations-heading" data-focus-target="sidebar">
      <div className="sidebar-title-row">
        <h3 id="conversations-heading" className="section-label">
          Conversations
        </h3>
        <button
          type="button"
          className="icon-button"
          aria-label="Start a new conversation"
          aria-haspopup="dialog"
          onClick={onNewChat}
        >
          <Plus aria-hidden="true" size={16} />
        </button>
      </div>
      <p id="conversations-help" className="sr-only">
        Use Up and Down Arrow to move between conversations. Press Enter to open the focused conversation.
      </p>
      {conversations.length === 0 ? (
        <p className="empty-note">No conversations yet.</p>
      ) : (
        conversations.map((conversation) => {
          const name = getConversationName(conversation, currentUser.id);
          return (
            <button
              {...getItemProps(conversation.id)}
              key={conversation.id}
              type="button"
              className={`conversation-item ${activeId === conversation.id ? "selected" : ""}`}
              aria-current={activeId === conversation.id ? "page" : undefined}
              aria-describedby="conversations-help"
              onClick={() => onSelectConversation(conversation.id)}
            >
              <span className="avatar" aria-hidden="true">
                {conversation.type === "group" ? (
                  <Users size={18} />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </span>
              <span className="conversation-copy">
                <span className="conversation-name">{name}</span>
                <span className="conversation-preview">
                  {conversation.lastMessage || "No messages yet"}
                </span>
              </span>
              <span className="time-chip">{relativeTime(conversation.lastMessageTime)}</span>
            </button>
          );
        })
      )}
    </section>
  );
}
