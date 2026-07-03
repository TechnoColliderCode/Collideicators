import {
  Bell,
  Calendar,
  Check,
  Hash,
  Headphones,
  Home,
  LogOut,
  MessageCircle,
  Mic,
  MicOff,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { localStore } from "./data/localStore";
import type {
  Channel,
  ChatTarget,
  Conversation,
  Friend,
  Message,
  Server,
  User,
} from "./types";

const formatTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const relativeTime = (value: string | null) => {
  if (!value) {
    return "";
  }

  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) {
    return "now";
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  return `${Math.floor(hours / 24)}d`;
};

const getConversationName = (conversation: Conversation, currentUserId: string) => {
  if (conversation.name) {
    return conversation.name;
  }

  const otherNames = conversation.participantNames.filter(
    (_, index) => conversation.participantIds[index] !== currentUserId,
  );
  return otherNames.join(", ") || "Conversation";
};

function App() {
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    "conversation_alex_jordan",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [rightTab, setRightTab] = useState<"notifications" | "calendar" | null>(null);
  const [callTitle, setCallTitle] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const snapshot = useSyncExternalStore(
    localStore.subscribe,
    localStore.snapshot,
    localStore.snapshot,
  );
  const currentUser = snapshot.users.find((user) => user.id === localStore.currentUserId) ?? null;
  const servers = currentUser
    ? snapshot.servers.filter((server) => server.memberIds.includes(currentUser.id))
    : [];
  const conversations = currentUser
    ? snapshot.conversations
        .filter((conversation) => conversation.participantIds.includes(currentUser.id))
        .sort((a, b) => (b.lastMessageTime ?? "").localeCompare(a.lastMessageTime ?? ""))
    : [];
  const activeServer = servers.find((server) => server.id === activeServerId) ?? null;
  const channels = activeServer
    ? snapshot.channels.filter((channel) => channel.serverId === activeServer.id)
    : [];
  const activeChannel = channels.find((channel) => channel.id === activeChannelId) ?? null;
  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ?? null;

  const activeTarget: ChatTarget | null = useMemo(() => {
    if (activeChannel) {
      return { kind: "channel", id: activeChannel.id };
    }

    if (activeConversation) {
      return { kind: "conversation", id: activeConversation.id };
    }

    return null;
  }, [activeChannel, activeConversation]);

  const messages = useMemo(() => {
    if (!activeTarget) {
      return [];
    }

    return snapshot.messages
      .filter((message) =>
        activeTarget.kind === "channel"
          ? message.channelId === activeTarget.id
          : message.conversationId === activeTarget.id,
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [activeTarget, snapshot.messages]);

  const chatTitle = activeChannel
    ? `# ${activeChannel.name}`
    : activeConversation && currentUser
      ? getConversationName(activeConversation, currentUser.id)
      : null;

  const chatSubtitle = activeChannel
    ? activeServer?.name
    : activeConversation?.type === "group"
      ? `${activeConversation.participantIds.length} members`
      : activeConversation
        ? "Direct message"
        : "";

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredConversations = conversations.filter((conversation) =>
    getConversationName(conversation, currentUser?.id ?? "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const selectServer = (serverId: string) => {
    const serverChannels = localStore.getChannels(serverId);
    setActiveServerId(serverId);
    setActiveChannelId(serverChannels[0]?.id ?? null);
    setActiveConversationId(null);
    setShowFriends(false);
    setCallTitle(null);
  };

  const goHome = () => {
    setActiveServerId(null);
    setActiveChannelId(null);
    setActiveConversationId(conversations[0]?.id ?? null);
    setShowFriends(false);
    setCallTitle(null);
  };

  const selectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setActiveServerId(null);
    setActiveChannelId(null);
    setShowFriends(false);
    setCallTitle(null);
  };

  const selectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setActiveConversationId(null);
    setShowFriends(false);
    setCallTitle(null);
  };

  const sendMessage = (content: string, fileUrl = "") => {
    if (!currentUser || !activeTarget) {
      return;
    }

    const message = localStore.sendMessage(
      activeTarget,
      currentUser,
      content,
      fileUrl ? "image" : "text",
      fileUrl,
    );
    setAnnouncement(`Sent message: ${message.content}`);
  };

  const startDirectConversation = (otherUserId: string) => {
    if (!currentUser) {
      return;
    }

    const conversation = localStore.getOrCreateDirectConversation(currentUser, otherUserId);
    selectConversation(conversation.id);
  };

  const createConversation = (selectedUsers: User[], groupName: string) => {
    if (!currentUser) {
      return;
    }

    const conversation = localStore.createConversation(currentUser, selectedUsers, groupName);
    setShowNewChat(false);
    selectConversation(conversation.id);
  };

  const createServer = (name: string) => {
    if (!currentUser) {
      return;
    }

    const { server, channels: newChannels } = localStore.createServer(currentUser, name);
    setShowCreateServer(false);
    setActiveServerId(server.id);
    setActiveChannelId(newChannels[0]?.id ?? null);
    setActiveConversationId(null);
  };

  const resetDemoData = () => {
    localStore.resetDemoData();
    setActiveServerId(null);
    setActiveChannelId(null);
    setActiveConversationId("conversation_alex_jordan");
    setShowFriends(false);
    setCallTitle(null);
    setAnnouncement("Demo data reset.");
  };

  if (!currentUser) {
    return (
      <main className="empty-page">
        <h1>Galaxia Star Communicators</h1>
        <p>Unable to load the local demo user.</p>
        <button type="button" onClick={resetDemoData}>
          Reset demo data
        </button>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      <ServerBar
        servers={servers}
        activeServerId={activeServerId}
        onGoHome={goHome}
        onSelectServer={selectServer}
        onCreateServer={() => setShowCreateServer(true)}
      />

      <div className="workspace">
        <ChatSidebar
          mode={activeServerId ? "server" : "dm"}
          conversations={filteredConversations}
          channels={filteredChannels}
          activeId={activeChannelId ?? activeConversationId}
          currentUser={currentUser}
          searchQuery={searchQuery}
          serverName={activeServer?.name ?? ""}
          showFriends={showFriends}
          onSearchChange={setSearchQuery}
          onSelectConversation={selectConversation}
          onSelectChannel={selectChannel}
          onShowFriends={() => {
            setShowFriends(true);
            setActiveConversationId(null);
            setActiveChannelId(null);
            setCallTitle(null);
          }}
          onNewChat={() => setShowNewChat(true)}
        />

        <main id="main-content" className="main-panel" tabIndex={-1}>
          {callTitle ? (
            <CallPlaceholder title={callTitle} onEnd={() => setCallTitle(null)} />
          ) : showFriends ? (
            <FriendsView
              users={snapshot.users}
              friends={snapshot.friends}
              currentUser={currentUser}
              onStartConversation={startDirectConversation}
            />
          ) : (
            <MessageArea
              messages={messages}
              currentUserId={currentUser.id}
              chatTitle={chatTitle}
              chatSubtitle={chatSubtitle}
              onSendMessage={sendMessage}
              onStartVoiceCall={() => chatTitle && setCallTitle(chatTitle)}
            />
          )}
        </main>

        <RightSidebar
          activeTab={rightTab}
          unreadCount={2}
          onChangeTab={setRightTab}
        />
      </div>

      <footer className="app-footer">
        <span>Local TypeScript prototype</span>
        <button type="button" onClick={resetDemoData}>
          Reset demo data
        </button>
      </footer>

      <CreateServerModal
        open={showCreateServer}
        onClose={() => setShowCreateServer(false)}
        onCreate={createServer}
      />
      <NewChatModal
        open={showNewChat}
        users={snapshot.users}
        currentUser={currentUser}
        onClose={() => setShowNewChat(false)}
        onCreate={createConversation}
      />
    </div>
  );
}

function ServerBar({
  servers,
  activeServerId,
  onGoHome,
  onSelectServer,
  onCreateServer,
}: {
  servers: Server[];
  activeServerId: string | null;
  onGoHome: () => void;
  onSelectServer: (serverId: string) => void;
  onCreateServer: () => void;
}) {
  return (
    <nav className="server-bar" aria-label="Servers">
      <button
        type="button"
        className={`server-button ${!activeServerId ? "active" : ""}`}
        aria-label="Home and direct messages"
        aria-current={!activeServerId ? "page" : undefined}
        onClick={onGoHome}
      >
        <Home aria-hidden="true" size={18} />
      </button>
      <div className="server-divider" aria-hidden="true" />
      {servers.map((server) => (
        <button
          key={server.id}
          type="button"
          className={`server-button ${activeServerId === server.id ? "active" : ""}`}
          aria-label={`Open ${server.name}`}
          aria-current={activeServerId === server.id ? "page" : undefined}
          onClick={() => onSelectServer(server.id)}
          style={{ "--server-color": server.color } as React.CSSProperties}
        >
          {server.name.charAt(0).toUpperCase()}
        </button>
      ))}
      <button
        type="button"
        className="server-button create"
        aria-label="Create server"
        onClick={onCreateServer}
      >
        <Plus aria-hidden="true" size={18} />
      </button>
    </nav>
  );
}

function ChatSidebar({
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
}: {
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
}) {
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
          <section aria-labelledby="channels-heading">
            <h3 id="channels-heading" className="section-label">
              Channels
            </h3>
            {channels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                className={`list-item ${activeId === channel.id ? "selected" : ""}`}
                aria-current={activeId === channel.id ? "page" : undefined}
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
        ) : (
          <section aria-labelledby="conversations-heading">
            <div className="sidebar-title-row">
              <h3 id="conversations-heading" className="section-label">
                Conversations
              </h3>
              <button type="button" className="icon-button" aria-label="Start a new conversation" onClick={onNewChat}>
                <Plus aria-hidden="true" size={16} />
              </button>
            </div>
            {conversations.length === 0 ? (
              <p className="empty-note">No conversations yet.</p>
            ) : (
              conversations.map((conversation) => {
                const name = getConversationName(conversation, currentUser.id);
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`conversation-item ${activeId === conversation.id ? "selected" : ""}`}
                    aria-current={activeId === conversation.id ? "page" : undefined}
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
        )}
      </div>
    </aside>
  );
}

function UserBar({ user }: { user: User }) {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);

  return (
    <div className="user-bar">
      <div className="avatar status-avatar" aria-hidden="true">
        {user.fullName.charAt(0).toUpperCase()}
        <span className={`presence ${user.status}`} />
      </div>
      <div className="user-copy">
        <p>{user.fullName}</p>
        <span>{user.email}</span>
      </div>
      <button
        type="button"
        className={`icon-button ${muted ? "danger" : ""}`}
        aria-label={muted ? "Unmute microphone" : "Mute microphone"}
        aria-pressed={muted}
        onClick={() => setMuted((value) => !value)}
      >
        {muted ? <MicOff aria-hidden="true" size={16} /> : <Mic aria-hidden="true" size={16} />}
      </button>
      <button
        type="button"
        className={`icon-button ${deafened ? "danger" : ""}`}
        aria-label={deafened ? "Undeafen audio" : "Deafen audio"}
        aria-pressed={deafened}
        onClick={() => setDeafened((value) => !value)}
      >
        <Headphones aria-hidden="true" size={16} />
      </button>
      <button type="button" className="icon-button" aria-label="Open settings">
        <Settings aria-hidden="true" size={16} />
      </button>
    </div>
  );
}

function MessageArea({
  messages,
  currentUserId,
  chatTitle,
  chatSubtitle,
  onSendMessage,
  onStartVoiceCall,
}: {
  messages: Message[];
  currentUserId: string;
  chatTitle: string | null;
  chatSubtitle: string | undefined;
  onSendMessage: (content: string, fileUrl?: string) => void;
  onStartVoiceCall: () => void;
}) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

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

  const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      <div className="message-list" role="log" aria-live="polite" aria-label={chatTitle ? `${chatTitle} messages` : "Messages"}>
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
          />
          <button type="submit" className="send-button" disabled={!text.trim()} aria-label="Send message">
            <Send aria-hidden="true" size={18} />
          </button>
        </form>
      )}
    </section>
  );
}

function MessageBubble({
  message,
  isMine,
  showSender,
}: {
  message: Message;
  isMine: boolean;
  showSender: boolean;
}) {
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

function FriendsView({
  users,
  friends,
  currentUser,
  onStartConversation,
}: {
  users: User[];
  friends: Friend[];
  currentUser: User;
  onStartConversation: (userId: string) => void;
}) {
  const [tab, setTab] = useState<"online" | "all" | "pending" | "add">("online");
  const [search, setSearch] = useState("");

  const accepted = friends.filter((friend) => friend.status === "accepted");
  const pending = friends.filter((friend) => friend.status === "pending");
  const onlineFriends = accepted.filter((friend) => {
    const otherId = friend.requesterId === currentUser.id ? friend.targetId : friend.requesterId;
    return users.some((user) => user.id === otherId && user.status === "online");
  });

  const usersToAdd = users.filter((user) => {
    const alreadyConnected = friends.some(
      (friend) =>
        (friend.requesterId === currentUser.id && friend.targetId === user.id) ||
        (friend.targetId === currentUser.id && friend.requesterId === user.id),
    );
    return (
      user.id !== currentUser.id &&
      !alreadyConnected &&
      user.fullName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const visibleFriends = tab === "online" ? onlineFriends : tab === "all" ? accepted : pending;

  return (
    <section className="friends-panel" aria-labelledby="friends-heading">
      <header className="chat-header">
        <div className="chat-heading-group">
          <UserPlus aria-hidden="true" size={20} />
          <h1 id="friends-heading">Friends</h1>
        </div>
      </header>
      <div className="tabs" role="tablist" aria-label="Friend views">
        {[
          { id: "online", label: "Online", count: onlineFriends.length },
          { id: "all", label: "All", count: accepted.length },
          { id: "pending", label: "Pending", count: pending.length },
          { id: "add", label: "Add Friend", count: 0 },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? "selected" : ""}
            onClick={() => setTab(item.id as typeof tab)}
          >
            {item.label}
            {item.count > 0 && <span>{item.count}</span>}
          </button>
        ))}
      </div>

      <div className="friends-list">
        {tab === "add" ? (
          <>
            <label className="search-field add-search">
              <span className="sr-only">Search users</span>
              <Search aria-hidden="true" size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" />
            </label>
            {usersToAdd.map((user) => (
              <div key={user.id} className="friend-row">
                <span className="avatar" aria-hidden="true">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
                <span>{user.fullName}</span>
                <button
                  type="button"
                  onClick={() => localStore.createFriendRequest(currentUser, user)}
                >
                  Add
                </button>
              </div>
            ))}
            {usersToAdd.length === 0 && <p className="empty-note">No users found.</p>}
          </>
        ) : visibleFriends.length === 0 ? (
          <p className="empty-note">Nothing to show here yet.</p>
        ) : (
          visibleFriends.map((friend) => {
            const isRequester = friend.requesterId === currentUser.id;
            const otherId = isRequester ? friend.targetId : friend.requesterId;
            const otherName = isRequester ? friend.targetName : friend.requesterName;
            return (
              <div key={friend.id} className="friend-row">
                <span className="avatar" aria-hidden="true">
                  {otherName.charAt(0).toUpperCase()}
                </span>
                <span className="friend-copy">
                  <strong>{otherName}</strong>
                  <span>{friend.status}</span>
                </span>
                {friend.status === "pending" && !isRequester ? (
                  <>
                    <button type="button" aria-label={`Accept ${otherName}`} onClick={() => localStore.updateFriendStatus(friend.id, "accepted")}>
                      <Check aria-hidden="true" size={16} />
                    </button>
                    <button type="button" aria-label={`Decline ${otherName}`} onClick={() => localStore.deleteFriend(friend.id)}>
                      <X aria-hidden="true" size={16} />
                    </button>
                  </>
                ) : friend.status === "accepted" ? (
                  <button type="button" onClick={() => onStartConversation(otherId)}>
                    Message
                  </button>
                ) : (
                  <button type="button" onClick={() => localStore.deleteFriend(friend.id)}>
                    Cancel
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function RightSidebar({
  activeTab,
  unreadCount,
  onChangeTab,
}: {
  activeTab: "notifications" | "calendar" | null;
  unreadCount: number;
  onChangeTab: (tab: "notifications" | "calendar" | null) => void;
}) {
  if (!activeTab) {
    return (
      <aside className="right-rail" aria-label="Utilities">
        <button type="button" className="icon-button" aria-label="Open notifications" onClick={() => onChangeTab("notifications")}>
          <Bell aria-hidden="true" size={18} />
          <span className="badge">{unreadCount}</span>
        </button>
        <button type="button" className="icon-button" aria-label="Open calendar" onClick={() => onChangeTab("calendar")}>
          <Calendar aria-hidden="true" size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="right-panel" aria-label={activeTab === "notifications" ? "Notifications" : "Calendar"}>
      <header>
        <h2>{activeTab === "notifications" ? "Notifications" : "Calendar"}</h2>
        <button type="button" className="icon-button" aria-label="Close side panel" onClick={() => onChangeTab(null)}>
          <X aria-hidden="true" size={16} />
        </button>
      </header>
      {activeTab === "notifications" ? (
        <div className="utility-list">
          <p><strong>New message from Jordan</strong><span>Local chat is ready to test.</span></p>
          <p><strong>Friend request</strong><span>Sam is waiting for a response.</span></p>
        </div>
      ) : (
        <div className="utility-list">
          <p><strong>Today</strong><span>No real calendar integration yet.</span></p>
          <p><strong>Next step</strong><span>Choose a backend before adding sync.</span></p>
        </div>
      )}
    </aside>
  );
}

function CallPlaceholder({ title, onEnd }: { title: string; onEnd: () => void }) {
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

function CreateServerModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <Modal open={open} title="Create a server" onClose={onClose}>
      <form
        className="modal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) {
            return;
          }
          onCreate(name.trim());
          setName("");
        }}
      >
        <label>
          Server name
          <input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
        </label>
        <button type="submit" disabled={!name.trim()}>
          Create server
        </button>
      </form>
    </Modal>
  );
}

function NewChatModal({
  open,
  users,
  currentUser,
  onClose,
  onCreate,
}: {
  open: boolean;
  users: User[];
  currentUser: User;
  onClose: () => void;
  onCreate: (selectedUsers: User[], groupName: string) => void;
}) {
  const [selected, setSelected] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const otherUsers = users.filter((user) => user.id !== currentUser.id);

  useEffect(() => {
    if (!open) {
      setSelected([]);
      setGroupName("");
    }
  }, [open]);

  return (
    <Modal open={open} title="New conversation" onClose={onClose}>
      <form
        className="modal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (selected.length === 0) {
            return;
          }
          onCreate(selected, groupName);
        }}
      >
        {selected.length > 1 && (
          <label>
            Group name
            <input value={groupName} onChange={(event) => setGroupName(event.target.value)} />
          </label>
        )}
        <fieldset>
          <legend>Select people</legend>
          <div className="choice-list">
            {otherUsers.map((user) => {
              const isSelected = selected.some((item) => item.id === user.id);
              return (
                <label key={user.id} className="choice-row">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      setSelected((current) =>
                        isSelected
                          ? current.filter((item) => item.id !== user.id)
                          : [...current, user],
                      )
                    }
                  />
                  <span>{user.fullName}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <button type="submit" disabled={selected.length === 0}>
          {selected.length > 1 ? "Create group chat" : "Start chat"}
        </button>
      </form>
    </Modal>
  );
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header>
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export default App;
