import React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function ServerBar({ servers, activeServerId, onSelectServer, onCreateServer, onGoHome }) {
  return (
    <div className="h-14 bg-gradient-to-r from-[#0f0f1a] to-[#1a1a2e] flex items-center px-3 gap-2 border-b border-white/5 overflow-x-auto scrollbar-hide">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGoHome}
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
          !activeServerId
            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
            : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
        }`}
      >
        <span className="text-base">🌌</span>
      </motion.button>

      <div className="w-px h-6 bg-white/10 flex-shrink-0" />

      {servers.map((server) => (
        <motion.button
          key={server.id}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectServer(server.id)}
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            activeServerId === server.id
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/50"
              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          }`}
          style={activeServerId === server.id ? {} : { backgroundColor: `${server.color || '#6366f1'}30` }}
          title={server.name}
        >
          {server.icon_url ? (
            <img src={server.icon_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            server.name?.charAt(0)?.toUpperCase()
          )}
        </motion.button>
      ))}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateServer}
        className="flex-shrink-0 w-9 h-9 rounded-full bg-white/5 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 flex items-center justify-center transition-all"
      >
        <Plus size={18} />
      </motion.button>
    </div>
  );
}
