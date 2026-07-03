import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, Phone, Video, MoreVertical } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MessageBubble from "@/components/chat/MessageBubble";
import { motion } from "framer-motion";

export default function MessageArea({
  messages,
  currentUserId,
  onSendMessage,
  chatTitle,
  chatSubtitle,
  onStartVoiceCall,
  isLoading,
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await onSendMessage(text.trim());
    setText("");
    setSending(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await onSendMessage(file.name, "image", file_url);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a18] h-full">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/5 bg-[#0f0f1e]/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {chatTitle?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">{chatTitle || "Select a chat"}</h3>
            {chatSubtitle && <p className="text-white/30 text-[10px]">{chatSubtitle}</p>}
          </div>
        </div>
        {chatTitle && (
          <div className="flex items-center gap-1">
            <button
              onClick={onStartVoiceCall}
              className="p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Phone size={16} />
            </button>
            <button className="p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors">
              <Video size={16} />
            </button>
            <button className="p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/15">
            <span className="text-5xl mb-3">💬</span>
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const prevMsg = messages[i - 1];
            const showSender = !prevMsg || prevMsg.sender_id !== msg.sender_id;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.sender_id === currentUserId}
                showSender={showSender}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {chatTitle && (
        <div className="px-4 pb-4 pt-2 flex-shrink-0">
          <div className="flex items-end gap-2 bg-[#1a1a2e] rounded-2xl px-3 py-2 border border-white/5">
            <label className="p-1.5 text-white/30 hover:text-white/60 cursor-pointer transition-colors">
              <Paperclip size={18} />
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
            </label>
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message..."
              rows={1}
              className="flex-1 bg-transparent text-white text-sm resize-none focus:outline-none placeholder:text-white/20 max-h-24 py-1"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className={`p-1.5 rounded-full transition-all ${
                text.trim()
                  ? "bg-[#007AFF] text-white"
                  : "text-white/20"
              }`}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
