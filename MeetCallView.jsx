import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, MessageCircle, Check, X, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";

function FriendRow({ friend, type, currentUserId, onMessage, onAccept, onDecline, onRemove }) {
  const isRequester = friend.requester_id === currentUserId;
  const otherName = isRequester ? friend.target_name : friend.requester_name;
  const otherId = isRequester ? friend.target_id : friend.requester_id;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all border-b border-white/5 group">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {otherName?.charAt(0)?.toUpperCase()}
        </div>
        {type === "online" && (
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#111122]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{otherName || "Unknown"}</p>
        <p className="text-white/30 text-xs">
          {type === "pending" && isRequester ? "Outgoing request" : type === "pending" ? "Incoming request" : type === "online" ? "Online" : "Offline"}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {type === "pending" && !isRequester ? (
          <>
            <button onClick={() => onAccept(friend)} className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center">
              <Check size={15} />
            </button>
            <button onClick={() => onDecline(friend)} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center">
              <X size={15} />
            </button>
          </>
        ) : type === "pending" && isRequester ? (
          <button onClick={() => onDecline(friend)} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center">
            <X size={15} />
          </button>
        ) : (
          <>
            <button onClick={() => onMessage(otherId, otherName)} className="w-8 h-8 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white flex items-center justify-center">
              <MessageCircle size={15} />
            </button>
            <button onClick={() => onRemove(friend)} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center">
              <X size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function FriendsView({ currentUserId, onStartConversation }) {
  const [tab, setTab] = useState("online");
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;
    base44.entities.Friend.filter({
      $or: [{ requester_id: currentUserId }, { target_id: currentUserId }],
    }).then((f) => {
      setFriends(f);
      setLoading(false);
    });
    base44.entities.User.list().then(setAllUsers);
  }, [currentUserId]);

  const accepted = friends.filter((f) => f.status === "accepted");
  const pending = friends.filter((f) => f.status === "pending");

  const onlineFriends = accepted.filter((f) => {
    const otherId = f.requester_id === currentUserId ? f.target_id : f.requester_id;
    return allUsers.some((u) => u.id === otherId);
  });

  const filteredUsers = allUsers.filter((u) => {
    if (u.id === currentUserId) return false;
    const q = search.toLowerCase();
    const name = u.full_name || u.email || "";
    return name.toLowerCase().includes(q);
  });

  const sendRequest = async (targetUser) => {
    const req = await base44.entities.Friend.create({
      requester_id: currentUserId,
      requester_name: "You",
      target_id: targetUser.id,
      target_name: targetUser.full_name || targetUser.email,
      status: "pending",
    });
    setFriends((prev) => [...prev, req]);
  };

  const isFriendOrPending = (userId) => {
    return friends.some(
      (f) =>
        (f.requester_id === userId && f.target_id === currentUserId) ||
        (f.target_id === userId && f.requester_id === currentUserId)
    );
  };

  const handleAccept = async (friend) => {
    const updated = await base44.entities.Friend.update(friend.id, { status: "accepted" });
    setFriends((prev) => prev.map((f) => (f.id === friend.id ? updated : f)));
  };

  const handleDecline = async (friend) => {
    await base44.entities.Friend.delete(friend.id);
    setFriends((prev) => prev.filter((f) => f.id !== friend.id));
  };

  const handleRemove = async (friend) => {
    await base44.entities.Friend.delete(friend.id);
    setFriends((prev) => prev.filter((f) => f.id !== friend.id));
  };

  const handleMessage = async (otherId, otherName) => {
    onStartConversation(otherId, otherName);
  };

  const tabs = [
    { id: "online", label: "Online", count: onlineFriends.length },
    { id: "all", label: "All", count: accepted.length },
    { id: "pending", label: "Pending", count: pending.length },
  ];

  const listToShow =
    tab === "online" ? onlineFriends : tab === "all" ? accepted : tab === "pending" ? pending : [];

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a18] h-full">
      {/* Header */}
      <div className="h-14 px-4 flex items-center border-b border-white/5 bg-[#0f0f1e]/80 backdrop-blur-sm flex-shrink-0">
        <UserPlus size={18} className="text-white/60 mr-2" />
        <h3 className="text-white font-medium text-sm">Friends</h3>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-[#0f0f1e]/40">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              tab === t.id ? "bg-indigo-500 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-[10px] px-1.5 rounded-full ${tab === t.id ? "bg-white/20" : "bg-white/10"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => setTab("add")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            tab === "add" ? "bg-emerald-500 text-white" : "text-emerald-400/60 hover:bg-emerald-500/10 hover:text-emerald-400"
          }`}
        >
          Add Friend
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === "add" ? (
            <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by name..."
                  className="w-full bg-white/5 text-white text-sm rounded-lg pl-9 pr-3 py-2.5 placeholder:text-white/20 border border-white/5 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-2">Users</p>
              {filteredUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg transition-all">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {(u.full_name || u.email)?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="flex-1 text-white/80 text-sm truncate">{u.full_name || u.email}</span>
                  {isFriendOrPending(u.id) ? (
                    <span className="text-white/20 text-xs">Pending</span>
                  ) : (
                    <button
                      onClick={() => sendRequest(u)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium px-3 py-1 rounded-full hover:bg-indigo-500/10"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-white/20 text-sm text-center py-8">No users found</p>
              )}
            </motion.div>
          ) : (
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {listToShow.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/15">
                  <UserPlus size={32} className="mb-2" />
                  <p className="text-sm">
                    {tab === "pending" ? "No pending requests" : tab === "online" ? "No friends online" : "No friends yet"}
                  </p>
                </div>
              ) : (
                listToShow.map((f) => (
                  <FriendRow
                    key={f.id}
                    friend={f}
                    type={tab}
                    currentUserId={currentUserId}
                    onMessage={handleMessage}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onRemove={handleRemove}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
