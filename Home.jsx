import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";
import ServerBar from "@/components/chat/ServerBar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import MessageArea from "@/components/chat/MessageArea";
import SkypeCallView from "@/components/chat/SkypeCallView";
import MeetCallView from "@/components/chat/MeetCallView";
import CreateServerModal from "@/components/chat/CreateServerModal";
import NewChatModal from "@/components/chat/NewChatModal";
import FriendsView from "@/components/chat/FriendsView";
import RightSidebar from "@/components/chat/RightSidebar";

export default function Home() {
  const [user, setUser] = useState(null);
  const [servers, setServers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeServerId, setActiveServerId] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [channels, setChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [callMode, setCallMode] = useState(null); // "skype" | "meet" | null
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [rightTab, setRightTab] = useState(null); // "notifications" | "calendar" | null

  const MOCK_NOTIFICATIONS = [
    { id: 1, type: "message", title: "New message from Alex", desc: "Hey, are you free tonight?", time: "2m ago", unread: true },
    { id: 2, type: "mention", title: "You were mentioned in #general", desc: "@you check the new update!", time: "15m ago", unread: true },
    { id: 3, type: "friend", title: "Friend request", desc: "Jordan wants to be your friend", time: "1h ago", unread: true },
    { id: 4, type: "call", title: "Missed call", desc: "Missed voice call from Sam", time: "3h ago", unread: false },
    { id: 5, type: "message", title: "New message in Gaming Zone", desc: "Game night starts at 8!", time: "5h ago", unread: false },
  ];

  const MOCK_EVENTS = [
    { id: 1, title: "Team Standup", time: "09:00", color: "bg-indigo-500", day: 2 },
    { id: 2, title: "Design Review", time: "11:30", color: "bg-emerald-500", day: 2 },
    { id: 3, title: "Game Night", time: "20:00", color: "bg-purple-500", day: 3 },
    { id: 4, title: "Voice Call - Alex", time: "15:00", color: "bg-blue-500", day: 4 },
    { id: 5, title: "Music Listening Party", time: "18:00", color: "bg-amber-500", day: 5 },
  ];

  // Load user & initial data
  useEffect(() => {
    base44.auth.me().then(setUser);
    base44.entities.Server.list().then(setServers);
    base44.entities.Conversation.list("-last_message_time").then(setConversations);
  }, []);

  // Load channels when selecting a server
  useEffect(() => {
    if (activeServerId) {
      base44.entities.Channel.filter({ server_id: activeServerId }).then(setChannels);
      setActiveConversation(null);
      setActiveChannel(null);
      setMessages([]);
    }
  }, [activeServerId]);

  // Load messages when selecting a channel or conversation
  const loadMessages = useCallback(async (channelId, conversationId) => {
    setLoadingMessages(true);
    const query = channelId ? { channel_id: channelId } : { conversation_id: conversationId };
    const msgs = await base44.entities.Message.filter(query, "created_date", 50);
    setMessages(msgs);
    setLoadingMessages(false);
  }, []);

  const handleSelectChannel = (ch) => {
    setActiveChannel(ch);
    setActiveConversation(null);
    setShowFriends(false);
    setCallMode(null);
    loadMessages(ch.id, null);
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setActiveChannel(null);
    setActiveServerId(null);
    setShowFriends(false);
    setCallMode(null);
    loadMessages(null, conv.id);
  };

  const handleShowFriends = () => {
    setShowFriends(true);
    setActiveChannel(null);
    setActiveConversation(null);
    setCallMode(null);
  };

  const handleGoHome = () => {
    setActiveServerId(null);
    setActiveChannel(null);
    setShowFriends(false);
    setCallMode(null);
  };

  const handleStartConversationFromFriend = async (otherId, otherName) => {
    const existing = conversations.find(
      (c) =>
        c.type === "direct" &&
        c.participants?.length === 2 &&
        c.participants.includes(otherId) &&
        c.participants.includes(user.id)
    );
    if (existing) {
      handleSelectConversation(existing);
      return;
    }
    const conv = await base44.entities.Conversation.create({
      name: "",
      type: "direct",
      participants: [user.id, otherId],
      participant_names: [user.full_name || user.email, otherName],
    });
    setConversations((prev) => [conv, ...prev]);
    handleSelectConversation(conv);
  };

  const handleSendMessage = async (content, type = "text", fileUrl = null) => {
    if (!user) return;
    const msgData = {
      content,
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      type,
      file_url: fileUrl || "",
    };
    if (activeChannel) msgData.channel_id = activeChannel.id;
    if (activeConversation) msgData.conversation_id = activeConversation.id;

    const newMsg = await base44.entities.Message.create(msgData);
    setMessages((prev) => [...prev, newMsg]);

    // Update conversation last message
    if (activeConversation) {
      const updated = await base44.entities.Conversation.update(activeConversation.id, {
        last_message: content,
        last_message_time: new Date().toISOString(),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversation.id ? updated : c))
      );
    }
  };

  const handleCreateServer = async (name) => {
    const server = await base44.entities.Server.create({
      name,
      owner_id: user?.id,
      members: [user?.id],
    });
    // Create default channels
    await base44.entities.Channel.create({ name: "general", server_id: server.id, type: "text" });
    await base44.entities.Channel.create({ name: "voice", server_id: server.id, type: "voice" });
    setServers((prev) => [...prev, server]);
    setActiveServerId(server.id);
  };

  const handleCreateConversation = async (data) => {
    const conv = await base44.entities.Conversation.create(data);
    setConversations((prev) => [conv, ...prev]);
    handleSelectConversation(conv);
  };

  const handleStartCall = () => {
    if (activeConversation) {
      setCallMode("skype");
    } else if (activeChannel && activeServerId) {
      setCallMode("meet");
    }
  };

  const activeServer = servers.find((s) => s.id === activeServerId);
  const chatTitle = activeChannel
    ? `# ${activeChannel.name}`
    : activeConversation
    ? activeConversation.name ||
      (activeConversation.participant_names || [])
        .filter((_, i) => (activeConversation.participants || [])[i] !== user?.id)
        .join(", ")
    : null;

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.participant_names?.some((n) => n.toLowerCase().includes(q))
    );
  });

  const filteredChannels = channels.filter((ch) => {
    if (!searchQuery) return true;
    return ch.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div role="application" aria-label="Galaxia Star Communicators main interface" className="h-screen flex flex-col bg-[#0a0a18] overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-indigo-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Skip to main content
      </a>
      {/* Server Bar — Top */}
      <ServerBar
        servers={servers}
        activeServerId={activeServerId}
        onSelectServer={setActiveServerId}
        onCreateServer={() => setShowCreateServer(true)}
        onGoHome={handleGoHome}
      />

      {/* Main Content */}
      <div id="main-content" className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="relative">
          <ChatSidebar
            mode={activeServerId ? "server" : "dm"}
            conversations={filteredConversations}
            channels={filteredChannels}
            activeId={activeChannel?.id || activeConversation?.id}
            onSelectConversation={handleSelectConversation}
            onSelectChannel={handleSelectChannel}
            currentUserId={user?.id}
            currentUser={user}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            serverName={activeServer?.name}
            showFriends={showFriends}
            onShowFriends={handleShowFriends}
          />
          {!activeServerId && (
            <button
              onClick={() => setShowNewChat(true)}
              aria-label="Start a new conversation"
              className="absolute bottom-4 right-4 w-12 h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all"
            >
              <Plus size={22} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Chat / Call / Friends Area */}
        {callMode === "skype" ? (
          <SkypeCallView chatTitle={chatTitle} onEndCall={() => setCallMode(null)} />
        ) : callMode === "meet" ? (
          <MeetCallView
            channelName={activeChannel?.name}
            serverName={activeServer?.name}
            onEndCall={() => setCallMode(null)}
          />
        ) : showFriends ? (
          <FriendsView
            currentUserId={user?.id}
            onStartConversation={handleStartConversationFromFriend}
          />
        ) : (
          <MessageArea
            messages={messages}
            currentUserId={user?.id}
            onSendMessage={handleSendMessage}
            chatTitle={chatTitle}
            chatSubtitle={
              activeChannel
                ? activeServer?.name
                : activeConversation?.type === "group"
                ? `${(activeConversation.participants || []).length} members`
                : "Direct message"
            }
            onStartVoiceCall={handleStartCall}
            isLoading={loadingMessages}
          />
        )}

        {/* Right Sidebar — Teams Style */}
        <RightSidebar
          activeTab={rightTab}
          setActiveTab={setRightTab}
          notifications={MOCK_NOTIFICATIONS}
          events={MOCK_EVENTS}
        />
      </div>

      {/* Modals */}
      <CreateServerModal
        open={showCreateServer}
        onClose={() => setShowCreateServer(false)}
        onCreate={handleCreateServer}
      />
      <NewChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onCreateConversation={handleCreateConversation}
        currentUser={user}
      />
    </div>
  );
}
