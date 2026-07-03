import React, { useState } from "react";
import { Mic, MicOff, Headphones, HeadphoneOff, Settings, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_COLORS = {
  online: "#23A559",
  idle: "#F0B232",
  dnd: "#F23F43",
  offline: "#80848E",
};

const STATUS_LABELS = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

export default function UserBar({ user }) {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [status, setStatus] = useState("online");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const displayName = user?.full_name || user?.email || "User";
  const userTag = user?.email ? `#${user.email.split("@")[0].slice(-5)}` : "#00000";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-[#292B2F] px-2 py-2 flex items-center gap-1 flex-shrink-0 relative">
      {/* Profile + Status */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold"
        >
          {initials}
        </button>
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#292B2F]"
          style={{ backgroundColor: STATUS_COLORS[status] }}
        />
        {/* Status dropdown */}
        {showStatusMenu && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-10 left-0 bg-[#111122] rounded-lg shadow-xl border border-white/10 py-1 w-36 z-50"
          >
            {Object.entries(STATUS_COLORS).map(([key, color]) => (
              <button
                key={key}
                onClick={() => {
                  setStatus(key);
                  setShowStatusMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/5 transition-colors ${
                  status === key ? "text-white" : "text-white/60"
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {STATUS_LABELS[key]}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Name + Tag */}
      <div className="flex-1 min-w-0 px-1">
        <p className="text-white text-xs font-semibold truncate leading-tight">{displayName}</p>
        <p className="text-white/40 text-[10px] truncate leading-tight">{userTag}</p>
      </div>

      {/* Mute */}
      <button
        onClick={() => setMuted(!muted)}
        className={`flex items-center rounded-md transition-all flex-shrink-0 ${
          muted ? "bg-[#382425]" : "hover:bg-white/5"
        }`}
      >
        <div className={`p-1.5 ${muted ? "text-[#F23F43]" : "text-[#DBDEE1]"}`}>
          {muted ? <MicOff size={16} /> : <Mic size={16} />}
        </div>
        <ChevronDown size={12} className={muted ? "text-[#F23F43]/60" : "text-white/30"} />
      </button>

      {/* Deafen */}
      <button
        onClick={() => setDeafened(!deafened)}
        className={`flex items-center rounded-md transition-all flex-shrink-0 ${
          deafened ? "bg-[#382425]" : "hover:bg-white/5"
        }`}
      >
        <div className={`p-1.5 ${deafened ? "text-[#F23F43]" : "text-[#DBDEE1]"}`}>
          {deafened ? <HeadphoneOff size={16} /> : <Headphones size={16} />}
        </div>
        <ChevronDown size={12} className={deafened ? "text-[#F23F43]/60" : "text-white/30"} />
      </button>

      {/* Settings */}
      <button className="p-1.5 text-[#DBDEE1] hover:bg-white/5 rounded-md transition-all flex-shrink-0">
        <Settings size={16} />
      </button>
    </div>
  );
}
