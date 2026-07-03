import React, { useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageCircle, Film, X, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreaming } from "@/hooks/useStreaming";
import StreamingControls from "@/components/chat/StreamingControls";
import ViewerCountOverlay from "@/components/chat/ViewerCountOverlay";

const MOCK_PARTICIPANTS = [
  { id: "1", name: "You", isSelf: true },
  { id: "2", name: "Alex" },
  { id: "3", name: "Jordan" },
  { id: "4", name: "Sam" },
];

const BASE_BTN = "w-11 h-11 rounded-full flex items-center justify-center transition-all";
const IDLE_BTN = "bg-white/10 text-white/70 hover:bg-white/20";

export default function SkypeCallView({ chatTitle, onEndCall }) {
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const streaming = useStreaming();

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a2e] h-full">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between bg-[#0f0f1e] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/80 text-sm font-medium">{chatTitle} — Group Call</span>
        </div>
        <div className="flex items-center gap-3">
          {streaming.recording && (
            <span className="flex items-center gap-1 text-red-400 text-xs">
              <Circle size={8} className="fill-red-400 animate-pulse" /> REC {streaming.fmtTime(streaming.recordTime)}
            </span>
          )}
          <span className="text-white/30 text-xs">{MOCK_PARTICIPANTS.length} people</span>
        </div>
      </div>

      {/* Participant Grid — Skype Style */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-3 overflow-y-auto relative">
        <ViewerCountOverlay count={streaming.viewers} />
        {streaming.sharing && (
          <div className="col-span-2 rounded-2xl overflow-hidden border-2 border-indigo-500/50 bg-black relative">
            <video ref={streaming.screenRef} autoPlay muted className="w-full h-full max-h-[300px] object-contain" />
            <span className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">Screen Sharing</span>
          </div>
        )}
        {MOCK_PARTICIPANTS.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative rounded-2xl overflow-hidden flex items-center justify-center ${
              p.isSelf ? "bg-gradient-to-br from-indigo-600/30 to-purple-700/30" : "bg-[#0f0f1e]"
            } border border-white/5`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {p.name.charAt(0)}
              </div>
              <span className="text-white/70 text-sm">{p.isSelf ? "You" : p.name}</span>
            </div>
            {p.isSelf && !videoOn && (
              <div className="absolute inset-0 bg-[#0a0a18]/80 flex items-center justify-center">
                <VideoOff size={24} className="text-white/20" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Media Player Overlay */}
      <AnimatePresence>
        {streaming.showMedia && streaming.mediaUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#0f0f1e] border-t border-white/10 px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-white/70 text-xs">
                <Film size={14} /> Now Playing: {streaming.mediaName}
              </span>
              <button onClick={() => streaming.setShowMedia(false)} className="text-white/30 hover:text-white/60">
                <X size={16} />
              </button>
            </div>
            <video src={streaming.mediaUrl} controls autoPlay className="w-full max-h-40 rounded-lg bg-black" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls — Skype Style */}
      <div className="h-20 flex items-center justify-center gap-2 bg-[#0f0f1e] border-t border-white/5 px-4 flex-wrap">
        <button
          onClick={() => setMuted(!muted)}
          className={`${BASE_BTN} ${muted ? "bg-red-500/20 text-red-400" : IDLE_BTN}`}
          title="Mute"
        >
          {muted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button
          onClick={() => setVideoOn(!videoOn)}
          className={`${BASE_BTN} ${!videoOn ? "bg-red-500/20 text-red-400" : IDLE_BTN}`}
          title="Camera"
        >
          {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>
        <StreamingControls streaming={streaming} baseClass={BASE_BTN} idleClass={IDLE_BTN} />
        <button className={`${BASE_BTN} ${IDLE_BTN}`} title="Chat">
          <MessageCircle size={18} />
        </button>
        <button
          onClick={onEndCall}
          className="w-14 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/30"
          title="End Call"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
}
