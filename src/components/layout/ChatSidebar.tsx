import {
  Hash,
  Headphones,
  Mic,
  MicOff,
  PhoneOff,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import type { Channel, Conversation, PresenceStatus, User, VoiceSession } from "../../types";
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
  unread: Record<string, { count: number; mentions: number }>;
  voice: VoiceSession;
  voiceLabel: string | null;
  onSearchChange: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onSelectChannel: (channelId: string) => void;
  onShowFriends: () => void;
  onNewChat: () => void;
  onStatusChange: (status: PresenceStatus) => void;
  onJoinVoice: (channelId: string) => void;
  onLeaveVoice: () => void;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
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
  unread,
  voice,
  voiceLabel,
  onSearchChange,
  onSelectConversation,
  onSelectChannel,
  onShowFriends,
  onNewChat,
  onStatusChange,
  onJoinVoice,
  onLeaveVoice,
  onToggleMute,
  onToggleDeafen,
}: ChatSidebarProps) {
  return (
    <aside className="chat-sidebar" aria-label={mode === "server" ? "Server channels" : "Direct messages"}>
      <UserBar user={currentUser} onStatusChange={onStatusChange} />
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
            unread={unread}
            voice={voice}
            onSelectChannel={onSelectChannel}
            onJoinVoice={onJoinVoice}
          />
        ) : (
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            currentUser={currentUser}
            unread={unread}
            onSelectConversation={onSelectConversation}
            onNewChat={onNewChat}
          />
        )}
      </div>

      {voice.channelId && (
        <div className="voice-panel">
          <div className="voice-panel-head">
            <span className="voice-live-dot" aria-hidden="true" />
            <span>
              <strong>Voice connected</strong>
              <span className="voice-room">{voiceLabel ?? "Voice room"}</span>
            </span>
            <button
              type="button"
              className="icon-button"
              aria-label="Disconnect from voice"
              onClick={onLeaveVoice}
            >
              <PhoneOff aria-hidden="true" size={16} />
            </button>
          </div>
          <div className="voice-panel-actions">
            <button
              type="button"
              className={`icon-button ${voice.muted ? "danger" : ""}`}
              aria-label={voice.muted ? "Unmute microphone" : "Mute microphone"}
              aria-pressed={voice.muted}
              onClick={onToggleMute}
            >
              {voice.muted ? <MicOff aria-hidden="true" size={16} /> : <Mic aria-hidden="true" size={16} />}
            </button>
            <button
              type="button"
              className={`icon-button ${voice.deafened ? "danger" : ""}`}
              aria-label={voice.deafened ? "Undeafen audio" : "Deafen audio"}
              aria-pressed={voice.deafened}
              onClick={onToggleDeafen}
            >
              <Headphones aria-hidden="true" size={16} />
            </button>
            <span className="voice-count">
              <Users aria-hidden="true" size={14} />
              {voice.participantIds.length}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}

function ChannelList({
  channels,
  activeId,
  unread,
  voice,
  onSelectChannel,
  onJoinVoice,
}: {
  channels: Channel[];
  activeId: string | null;
  unread: Record<string, { count: number; mentions: number }>;
  voice: VoiceSession;
  onSelectChannel: (channelId: string) => void;
  onJoinVoice: (channelId: string) => void;
}) {
  const ids = useMemo(() => channels.map((channel) => channel.id), [channels]);
  const { getItemProps } = useRovingFocus({
    ids,
    selectedId: activeId,
    orientation: "vertical",
    onActivate: (id) => {
      const channel = channels.find((item) => item.id === id);
      if (channel?.type === "voice") {
        onJoinVoice(channel.id);
      } else {
        onSelectChannel(id);
      }
    },
  });

  return (
    <section aria-labelledby="channels-heading" data-focus-target="sidebar">
      <h3 id="channels-heading" className="section-label">
        Channels
      </h3>
      <p id="channels-help" className="sr-only">
        Use Up and Down Arrow to move between channels. Press Enter to open the focused channel.
        Voice channels join the voice room.
      </p>
      {channels.map((channel) => {
        const summary = unread[channel.id] ?? { count: 0, mentions: 0 };
        const joined = voice.channelId === channel.id;
        return (
          <button
            {...getItemProps(channel.id)}
            key={channel.id}
            type="button"
            className={`list-item ${activeId === channel.id ? "selected" : ""} ${joined ? "in-voice" : ""}`}
            aria-current={activeId === channel.id ? "page" : undefined}
            aria-describedby="channels-help"
            onClick={() =>
              channel.type === "voice" ? onJoinVoice(channel.id) : onSelectChannel(channel.id)
            }
          >
            {channel.type === "voice" ? (
              <Headphones aria-hidden="true" size={16} />
            ) : (
              <Hash aria-hidden="true" size={16} />
            )}
            <span>{channel.name}</span>
            {channel.type === "voice" ? (
              joined ? (
                <span className="meta voice-meta">Connected</span>
              ) : (
                <span className="meta">
                  {channel.participantCount}/{channel.maxParticipants}
                </span>
              )
            ) : summary.count > 0 ? (
              <span className={`unread-badge ${summary.mentions > 0 ? "mention" : ""}`}>
                {summary.mentions > 0 ? summary.mentions : summary.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </section>
  );
}

function ConversationList({
  conversations,
  activeId,
  currentUser,
  unread,
  onSelectConversation,
  onNewChat,
}: {
  conversations: Conversation[];
  activeId: string | null;
  currentUser: User;
  unread: Record<string, { count: number; mentions: number }>;
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
          const summary = unread[conversation.id] ?? { count: 0, mentions: 0 };
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
              {summary.count > 0 ? (
                <span className={`unread-badge ${summary.mentions > 0 ? "mention" : ""}`}>
                  {summary.mentions > 0 ? summary.mentions : summary.count}
                </span>
              ) : (
                <span className="time-chip">{relativeTime(conversation.lastMessageTime)}</span>
              )}
            </button>
          );
        })
      )}
    </section>
  );
}
