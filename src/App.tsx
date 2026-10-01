import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AuthScreen } from "./components/auth/AuthScreen";
import { CallPanel } from "./components/calls/CallPanel";
import { SkypeCallPanel } from "./components/calls/SkypeCallPanel";
import { MessageArea } from "./components/chat/MessageArea";
import { FriendsView } from "./components/friends/FriendsView";
import { ChatSidebar } from "./components/layout/ChatSidebar";
import { MembersPanel } from "./components/layout/MembersPanel";
import { ServerBar } from "./components/layout/ServerBar";
import { CreateServerModal } from "./components/modals/CreateServerModal";
import { InviteServerModal } from "./components/modals/InviteServerModal";
import { JoinServerModal } from "./components/modals/JoinServerModal";
import { NewChatModal } from "./components/modals/NewChatModal";
import { RightSidebar } from "./components/utilities/RightSidebar";
import type { NotificationItem } from "./components/utilities/RightSidebar";
import { localStore, replyPayload } from "./data/localStore";
import type { AuthResult } from "./data/localStore";
import { mediaStore } from "./data/media";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import type { ChatTarget, Conversation, Message, PresenceStatus, User } from "./types";
import { summarizeUnread, targetKey } from "./utils/chat";
import { getConversationName } from "./utils/conversation";

interface ActiveCall {
  title: string;
  kind: "voice" | "video";
  participants: User[];
}

function App() {
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [inviteServerId, setInviteServerId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [rightTab, setRightTab] = useState<"notifications" | "calendar" | null>(null);
  const [call, setCall] = useState<ActiveCall | null>(null);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const mainRef = useRef<HTMLElement | null>(null);

  const snapshot = useSyncExternalStore(
    localStore.subscribe,
    localStore.snapshot,
    localStore.snapshot,
  );
  const media = useSyncExternalStore(
    mediaStore.subscribe,
    mediaStore.getSnapshot,
    mediaStore.getSnapshot,
  );

  useEffect(() => {
    mediaStore.setMicEnabled(!snapshot.voice.muted && !snapshot.voice.deafened);
  }, [snapshot.voice.muted, snapshot.voice.deafened]);
  const currentUser =
    snapshot.users.find((user) => user.id === snapshot.currentUserId) ?? null;
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

  const activeTargetKey = activeTarget ? targetKey(activeTarget) : null;

  useEffect(() => {
    if (activeTargetKey) {
      localStore.markRead(activeTargetKey);
    }
  }, [activeTargetKey]);

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

  const participants: User[] = useMemo(() => {
    if (activeServer) {
      return snapshot.users.filter((user) => activeServer.memberIds.includes(user.id));
    }
    if (activeConversation) {
      return snapshot.users.filter((user) =>
        activeConversation.participantIds.includes(user.id),
      );
    }
    return [];
  }, [activeServer, activeConversation, snapshot.users]);

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredConversations = conversations.filter((conversation) =>
    getConversationName(conversation, currentUser?.id ?? "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const unread: Record<string, { count: number; mentions: number }> = {};
  if (currentUser) {
    conversations.forEach((conversation) => {
      unread[conversation.id] = summarizeUnread(
        snapshot,
        `conversation:${conversation.id}`,
        currentUser.id,
      );
    });
    channels.forEach((channel) => {
      unread[channel.id] = summarizeUnread(snapshot, `channel:${channel.id}`, currentUser.id);
    });
  }

  const voiceChannel = snapshot.channels.find((channel) => channel.id === snapshot.voice.channelId) ?? null;
  const voiceServer = voiceChannel
    ? snapshot.servers.find((server) => server.id === voiceChannel.serverId) ?? null
    : null;
  const voiceLabel =
    voiceChannel && voiceServer ? `${voiceServer.name} / ${voiceChannel.name}` : null;
  const inVoiceRoom = Boolean(
    activeServer && voiceChannel && voiceChannel.serverId === activeServer.id,
  );
  const voiceUsers = snapshot.voice.participantIds
    .map((id) => snapshot.users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user));

  const typingUserId = activeTargetKey ? snapshot.typing[activeTargetKey] : undefined;
  const typingUser = typingUserId
    ? snapshot.users.find((user) => user.id === typingUserId) ?? null
    : null;
  const typingUserName =
    typingUser && typingUser.id !== currentUser?.id ? typingUser.fullName.split(" ")[0] : null;

  const notifications: NotificationItem[] = currentUser
    ? [
        ...snapshot.friends
          .filter((friend) => friend.status === "pending" && friend.targetId === currentUser.id)
          .map((friend) => ({
            id: friend.id,
            title: "Friend request",
            detail: `${friend.requesterName} wants to add you as a friend.`,
          })),
        ...snapshot.messages
          .filter(
            (message) =>
              message.senderId !== currentUser.id &&
              !message.unsent &&
              (message.mentions ?? []).includes(currentUser.id),
          )
          .slice(-5)
          .reverse()
          .map((message) => ({
            id: message.id,
            title: `${message.senderName} mentioned you`,
            detail: message.content,
          })),
      ]
    : [];

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
  }, [activeChannelId, activeConversationId, call, showFriends, inVoiceRoom]);

  const clearCallContext = () => {
    if (call) {
      mediaStore.releaseAll();
      if (snapshot.voice.channelId) {
        void mediaStore.ensureMic();
      }
    }
    setCall(null);
    setReplyTarget(null);
    setShowMembers(false);
  };

  const selectServer = (serverId: string) => {
    const serverChannels = localStore.getChannels(serverId);
    setShowFriends(false);
    clearCallContext();
    setActiveServerId(serverId);
    setActiveConversationId(null);

    const connectedChannel = snapshot.voice.channelId;
    if (connectedChannel && serverChannels.some((channel) => channel.id === connectedChannel)) {
      setActiveChannelId(connectedChannel);
      return;
    }

    const firstChannel = serverChannels[0];
    if (firstChannel) {
      joinVoice(firstChannel.id);
    } else {
      setActiveChannelId(null);
    }
  };

  const goHome = () => {
    setActiveServerId(null);
    setActiveChannelId(null);
    setActiveConversationId(conversations[0]?.id ?? null);
    setShowFriends(false);
    clearCallContext();
  };

  const selectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setActiveServerId(null);
    setActiveChannelId(null);
    setShowFriends(false);
    clearCallContext();
  };

  const joinVoice = (channelId: string) => {
    if (!currentUser) {
      return;
    }

    if (snapshot.voice.channelId === channelId) {
      return;
    }

    const channel = snapshot.channels.find((item) => item.id === channelId);
    localStore.joinVoice(channelId, currentUser.id);
    void mediaStore.ensureMic();
    setAnnouncement(`Joined voice room ${channel?.name ?? ""}.`);
    clearCallContext();
    setShowFriends(false);

    if (channel) {
      setActiveServerId(channel.serverId);
      setActiveChannelId(channel.id);
      setActiveConversationId(null);
    }
  };

  const sendMessage = (content: string, fileUrl = "", reply: Message | null = null) => {
    if (!currentUser || !activeTarget) {
      return;
    }

    const message = localStore.sendMessage(
      activeTarget,
      currentUser,
      content,
      fileUrl ? "image" : "text",
      fileUrl,
      reply ? replyPayload(reply) : null,
    );
    setReplyTarget(null);
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
    clearCallContext();
    setAnnouncement(`Created server ${server.name}.`);
  };

  const joinServerByInvite = (input: string) => {
    if (!currentUser) {
      return { ok: false, error: "No account is signed in." };
    }

    const result = localStore.joinServerByInvite(currentUser, input);
    if (result.ok && result.serverId) {
      setShowJoinServer(false);
      setAnnouncement("Joined server from invite.");
      selectServer(result.serverId);
    }
    return result;
  };

  const inviteServer = servers.find((server) => server.id === inviteServerId) ?? null;

  const startChatCall = (kind: "voice" | "video") => {
    if (!chatTitle) {
      return;
    }

    if (activeServer) {
      const connectedHere = channels.some(
        (channel) => channel.id === snapshot.voice.channelId,
      );
      if (!connectedHere && channels[0]) {
        joinVoice(channels[0].id);
      }
      return;
    }

    if (!activeConversation) {
      return;
    }

    setReplyTarget(null);
    setShowFriends(false);
    setCall({
      title: getConversationName(activeConversation, currentUser?.id ?? ""),
      kind,
      participants,
    });
    void mediaStore.ensureMic();
    if (kind === "video") {
      void mediaStore.ensureCamera();
    }
    setAnnouncement(`Started ${kind} call with ${chatTitle}.`);
  };

  const joinMeeting = (title: string, participantIds: string[]) => {
    const callParticipants = snapshot.users.filter((user) => participantIds.includes(user.id));
    setShowFriends(false);
    setActiveServerId(null);
    setActiveChannelId(null);
    setReplyTarget(null);
    setCall({ title, kind: "video", participants: callParticipants });
    void mediaStore.ensureMic();
    void mediaStore.ensureCamera();
    setAnnouncement(`Joined meeting: ${title}.`);
  };

  const createMeeting = (title: string, startsAt: string) => {
    if (!currentUser) {
      return;
    }
    const participantIds = snapshot.friends
      .filter((friend) => friend.status === "accepted")
      .map((friend) =>
        friend.requesterId === currentUser.id ? friend.targetId : friend.requesterId,
      );
    localStore.createMeeting(currentUser, title, startsAt, participantIds);
    setAnnouncement(`Meeting scheduled: ${title}.`);
  };

  const setPresence = (status: PresenceStatus) => {
    if (!currentUser) {
      return;
    }
    localStore.updateUserStatus(currentUser.id, status);
    setAnnouncement(`Status set to ${status}.`);
  };

  const toggleVoiceMute = () => {
    localStore.setVoiceSetting({ muted: !snapshot.voice.muted });
  };

  const toggleVoiceDeafen = () => {
    localStore.setVoiceSetting({ deafened: !snapshot.voice.deafened });
  };

  const toggleMediaMute = () => {
    void mediaStore.toggleMic();
  };

  const toggleCamera = () => {
    void mediaStore.toggleCamera();
  };

  const toggleScreen = () => {
    mediaStore.toggleScreen();
  };

  const resetLocalData = () => {
    localStore.resetLocalData();
    mediaStore.releaseAll();
    const state = localStore.snapshot();
    setActiveServerId(null);
    setActiveChannelId(null);
    setActiveConversationId(null);
    setShowFriends(false);
    setShowMembers(false);
    setCall(null);
    setReplyTarget(null);
    setAnnouncement(state.currentUserId ? "Local data reset." : "Local data cleared.");
  };

  const applyAuthResult = (result: AuthResult): AuthResult => {
    if (!result.ok || !result.userId) {
      return result;
    }

    const state = localStore.snapshot();
    setActiveServerId(null);
    setActiveChannelId(null);
    setActiveConversationId(
      getConversationsForUser(state.conversations, result.userId)[0]?.id ?? null,
    );
    setShowFriends(false);
    setShowMembers(false);
    setCall(null);
    setReplyTarget(null);
    setSearchQuery("");
    setAnnouncement("Logged in.");
    return result;
  };

  const handleLogin = (identifier: string, password: string) =>
    applyAuthResult(localStore.login(identifier, password));

  const handleRegister = (username: string, email: string, password: string) =>
    applyAuthResult(localStore.register(username, email, password));

  const handleLogout = () => {
    localStore.logout();
    mediaStore.releaseAll();
    setActiveServerId(null);
    setActiveChannelId(null);
    setActiveConversationId(null);
    setShowFriends(false);
    clearCallContext();
    setSearchQuery("");
    setAnnouncement("Logged out.");
  };

  if (snapshot.currentUserId === null) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onResetData={resetLocalData}
      />
    );
  }

  if (!currentUser) {
    return (
      <main className="empty-page">
        <h1>Galaxia Star Communicators</h1>
        <p>Unable to load your saved account.</p>
        <button type="button" onClick={resetLocalData}>
          Reset local data
        </button>
      </main>
    );
  }

  const showMembersPanel = showMembers && Boolean(activeServer) && !call && !inVoiceRoom;

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
        onJoinServer={() => setShowJoinServer(true)}
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
          unread={unread}
          voice={snapshot.voice}
          voiceLabel={voiceLabel}
          onSearchChange={setSearchQuery}
          onSelectConversation={selectConversation}
          onShowFriends={() => {
            setShowFriends(true);
            setActiveConversationId(null);
            setActiveChannelId(null);
            clearCallContext();
          }}
          onNewChat={() => setShowNewChat(true)}
          onInvite={() => {
            if (activeServer) {
              setInviteServerId(activeServer.id);
            }
          }}
          micLevel={media.level}
          onStatusChange={setPresence}
          onLogout={handleLogout}
          onJoinVoice={joinVoice}
          onLeaveVoice={() => {
            localStore.leaveVoice();
            mediaStore.releaseAll();
            setAnnouncement("Left the voice room.");
          }}
          onToggleMute={toggleVoiceMute}
          onToggleDeafen={toggleVoiceDeafen}
        />

        <main
          ref={mainRef}
          id="main-content"
          className="main-panel"
          tabIndex={-1}
          aria-describedby="keyboard-shortcuts"
        >
          {call ? (
            <SkypeCallPanel
              title={call.title}
              kind={call.kind}
              participants={call.participants}
              currentUserId={currentUser.id}
              muted={!media.micEnabled}
              cameraOn={media.cameraEnabled}
              sharing={media.screen === "live"}
              mediaError={media.error}
              cameraStream={mediaStore.getCameraStream()}
              onToggleMute={toggleMediaMute}
              onToggleCamera={toggleCamera}
              onToggleScreen={toggleScreen}
              onEnd={() => {
                setCall(null);
                mediaStore.releaseAll();
                if (snapshot.voice.channelId) {
                  void mediaStore.ensureMic();
                }
                setAnnouncement("Call ended.");
              }}
            />
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
          ) : inVoiceRoom && activeServer && voiceChannel ? (
            <div className="voice-room-layout">
              <section className="voice-room-stage" aria-label={`${activeServer.name} voice room`}>
                <CallPanel
                  title={`${activeServer.name} · ${voiceChannel.name}`}
                  kind="video"
                  participants={voiceUsers}
                  currentUserId={currentUser.id}
                  muted={!media.micEnabled}
                  cameraOn={media.cameraEnabled}
                  sharing={media.screen === "live"}
                  speaking={media.speaking}
                  mediaError={media.error}
                  cameraStream={mediaStore.getCameraStream()}
                  screenStream={mediaStore.getScreenStream()}
                  onToggleMute={toggleVoiceMute}
                  onToggleCamera={toggleCamera}
                  onToggleScreen={toggleScreen}
                  onEnd={() => {
                    localStore.leaveVoice();
                    mediaStore.releaseAll();
                    setAnnouncement("Left the voice room.");
                  }}
                />
              </section>
              <aside className="voice-room-chat" aria-label="Voice room chat">
                <MessageArea
                  messages={messages}
                  currentUserId={currentUser.id}
                  chatTitle={chatTitle}
                  chatSubtitle={chatSubtitle}
                  participants={participants}
                  replyTo={replyTarget}
                  typingUserName={typingUserName}
                  showStatus={activeConversation?.type === "direct"}
                  onSendMessage={sendMessage}
                  onCancelReply={() => setReplyTarget(null)}
                  onReply={setReplyTarget}
                  onReact={(messageId, emoji) =>
                    localStore.toggleReaction(messageId, currentUser.id, emoji)
                  }
                  onTogglePin={(messageId) => localStore.togglePin(messageId)}
                  onEdit={(messageId, content) =>
                    localStore.editMessage(messageId, currentUser, content)
                  }
                  onDelete={(messageId) => localStore.unsendMessage(messageId, currentUser)}
                  onStartVoiceCall={() => startChatCall("voice")}
                  onStartVideoCall={() => startChatCall("video")}
                />
              </aside>
            </div>
          ) : (
            <MessageArea
              messages={messages}
              currentUserId={currentUser.id}
              chatTitle={chatTitle}
              chatSubtitle={chatSubtitle}
              participants={participants}
              replyTo={replyTarget}
              typingUserName={typingUserName}
              showStatus={activeConversation?.type === "direct"}
              onSendMessage={sendMessage}
              onCancelReply={() => setReplyTarget(null)}
              onReply={setReplyTarget}
              onReact={(messageId, emoji) =>
                localStore.toggleReaction(messageId, currentUser.id, emoji)
              }
              onTogglePin={(messageId) => localStore.togglePin(messageId)}
              onEdit={(messageId, content) =>
                localStore.editMessage(messageId, currentUser, content)
              }
              onDelete={(messageId) => localStore.unsendMessage(messageId, currentUser)}
              onStartVoiceCall={() => startChatCall("voice")}
              onStartVideoCall={() => startChatCall("video")}
              membersOpen={showMembers}
              onToggleMembers={() => setShowMembers((open) => !open)}
            />
          )}

          {showMembersPanel && activeServer && (
            <MembersPanel
              serverName={activeServer.name}
              members={snapshot.users.filter((user) => activeServer.memberIds.includes(user.id))}
              ownerId={activeServer.ownerId}
              voiceParticipantIds={snapshot.voice.participantIds}
              onClose={() => setShowMembers(false)}
            />
          )}
        </main>

        <RightSidebar
          activeTab={rightTab}
          notifications={notifications}
          meetings={snapshot.meetings}
          onChangeTab={setRightTab}
          onCreateMeeting={createMeeting}
          onJoinMeeting={(meeting) => joinMeeting(meeting.title, meeting.participantIds)}
          onDeleteMeeting={(meetingId) => localStore.deleteMeeting(meetingId)}
        />
      </div>

      <footer className="app-footer">
        <span>Local TypeScript prototype</span>
        <button type="button" onClick={resetLocalData}>
          Reset local data
        </button>
      </footer>

      <CreateServerModal
        open={showCreateServer}
        onClose={() => setShowCreateServer(false)}
        onCreate={createServer}
      />
      <JoinServerModal
        open={showJoinServer}
        onClose={() => setShowJoinServer(false)}
        onJoin={joinServerByInvite}
      />
      <InviteServerModal
        open={inviteServerId !== null}
        server={inviteServer}
        onClose={() => setInviteServerId(null)}
        onReset={() => {
          if (inviteServerId) {
            localStore.resetInviteCode(inviteServerId);
            setAnnouncement("Invite link reset.");
          }
        }}
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
