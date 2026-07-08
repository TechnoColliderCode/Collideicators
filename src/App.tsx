import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CallPlaceholder } from "./components/calls/CallPlaceholder";
import { MessageArea } from "./components/chat/MessageArea";
import { FriendsView } from "./components/friends/FriendsView";
import { ChatSidebar } from "./components/layout/ChatSidebar";
import { ServerBar } from "./components/layout/ServerBar";
import { CreateServerModal } from "./components/modals/CreateServerModal";
import { NewChatModal } from "./components/modals/NewChatModal";
import { RightSidebar } from "./components/utilities/RightSidebar";
import { localStore } from "./data/localStore";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import type { ChatTarget, Conversation, User } from "./types";
import { getConversationName } from "./utils/conversation";

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
  const mainRef = useRef<HTMLElement | null>(null);

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
    ? getConversationsForUser(snapshot.conversations, currentUser.id)
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

  const focusTarget = (selector: string) => {
    const element = document.querySelector<HTMLElement>(selector);
    element?.focus();
  };

  useGlobalShortcuts({
    onFocusServers: () => focusTarget('[data-focus-target="servers"] [tabindex="0"]'),
    onFocusSidebar: () => focusTarget('[data-focus-target="sidebar"] [tabindex="0"], .wide-action'),
    onFocusMessages: () => focusTarget('[data-focus-target="messages"] [tabindex="0"], [data-focus-target="messages"]'),
    onFocusComposer: () => focusTarget('[data-focus-target="composer"]'),
    onFocusUtilities: () => focusTarget('[data-focus-target="utilities"] button'),
  });

  useEffect(() => {
    mainRef.current?.focus();
  }, [activeChannelId, activeConversationId, callTitle, showFriends]);

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
      <div id="keyboard-shortcuts" className="sr-only">
        Keyboard shortcuts: Control Alt 1 moves to servers. Control Alt 2 moves to chats or channels.
        Control Alt 3 moves to messages. Control Alt 4 moves to utilities. Control Alt M moves to the message composer.
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

        <main
          ref={mainRef}
          id="main-content"
          className="main-panel"
          tabIndex={-1}
          aria-describedby="keyboard-shortcuts"
        >
          {callTitle ? (
            <CallPlaceholder title={callTitle} onEnd={() => setCallTitle(null)} />
          ) : showFriends ? (
            <FriendsView
              users={snapshot.users}
              friends={snapshot.friends}
              currentUser={currentUser}
              onStartConversation={startDirectConversation}
              onCreateFriendRequest={(targetUser) => localStore.createFriendRequest(currentUser, targetUser)}
              onAcceptFriend={(friendId) => localStore.updateFriendStatus(friendId, "accepted")}
              onDeleteFriend={(friendId) => localStore.deleteFriend(friendId)}
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

const getConversationsForUser = (conversations: Conversation[], userId: string) =>
  conversations
    .filter((conversation) => conversation.participantIds.includes(userId))
    .sort((a, b) => (b.lastMessageTime ?? "").localeCompare(a.lastMessageTime ?? ""));

export default App;
