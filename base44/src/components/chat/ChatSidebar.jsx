import React from "react";
import { Search, MessageCircle, Users, Hash, Volume2, UserPlus } from "lucide-react";
import moment from "moment";
import { motion } from "framer-motion";
import UserBar from "@/components/chat/UserBar";

function ConversationItem({ conversation, isActive, onClick, currentUserId }) {
  const isGroup = conversation.type === "group";
  const otherNames = (conversation.participant_names || []).filter(
    (_, i) => (conversation.participants || [])[i] !== currentUserId
  );
  const displayName = conversation.name || otherNames.join(", ") || "Chat";
  const initials = displayName.charAt(0).toUpperCase();
  const timeAgo = conversation.last_message_time
    ? moment(conversation.last_message_time).fromNow(true)
    : "";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
        isActive
          ? "bg-white/10"
          : "hover:bg-white/5"
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
        {conversation.avatar_url ? (
          <img src={conversation.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : isGroup ? (
          <Users size={20} />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-sm truncate">{displayName}</span>
          {timeAgo && <span className="text-white/30 text-xs flex-shrink-0 ml-2">{timeAgo}</span>}
        </div>
        <p className="text-white/40 text-xs truncate mt-0.5">
          {conversation.last_message || "No messages yet"}
        </p>
      </div>
    </motion.button>
  );
}

function ChannelItem({ channel, isActive, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2 transition-all ${
        isActive ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
      }`}
    >
      <span className="text-sm truncate">{channel.name}</span>
      {channel.type === "voice" && (
        <span className="text-[10px] text-white/30 font-mono flex-shrink-0 ml-2">
          ({channel.participant_count || 0}/{channel.max_participants || 15})
        </span>
      )}
    </motion.button>
  );
}

export default function ChatSidebar({
  mode,
  conversations,
  channels,
  activeId,
  onSelectConversation,
  onSelectChannel,
  currentUserId,
  currentUser,
  searchQuery,
  onSearchChange,
  serverName,
  showFriends,
  onShowFriends,
}) {
  return (
    <div className="w-72 lg:w-80 bg-[#111122] flex flex-col h-full border-r border-white/5">
      <UserBar user={currentUser} />
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5">
        {mode === "server" ? (
          <h2 className="text-white font-semibold text-base mb-2">{serverName || "Server"}</h2>
        ) : (
          <button
            onClick={onShowFriends}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-2 transition-all ${
              showFriends ? "bg-indigo-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <UserPlus size={16} />
            <span className="text-sm font-medium">Friends</span>
          </button>
        )}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full bg-white/5 text-white text-sm rounded-lg pl-9 pr-3 py-2 placeholder:text-white/20 border border-white/5 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {mode === "server" ? (
          <div className="py-2">
            <p className="px-4 text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-1">Channels</p>
            {channels.map((ch) => (
              <ChannelItem
                key={ch.id}
                channel={ch}
                isActive={activeId === ch.id}
                onClick={() => onSelectChannel(ch)}
              />
            ))}
          </div>
        ) : showFriends ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/20">
            <UserPlus size={32} className="mb-2" />
            <p className="text-sm text-center px-4">Friends view is open →</p>
          </div>
        ) : (
          <div>
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeId === conv.id}
                onClick={() => onSelectConversation(conv)}
                currentUserId={currentUserId}
              />
            ))}
            {conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-white/20">
                <MessageCircle size={32} className="mb-2" />
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
