import React from "react";
import { motion } from "framer-motion";
import moment from "moment";

export default function MessageBubble({ message, isMine, showSender }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}
    >
      <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
        {showSender && !isMine && (
          <span className="text-[10px] text-white/30 ml-3 mb-0.5">{message.sender_name}</span>
        )}
        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? "bg-[#007AFF] text-white rounded-br-md"
              : "bg-[#2a2a3e] text-white/90 rounded-bl-md"
          }`}
        >
          {message.type === "image" && message.file_url && (
            <img src={message.file_url} alt="" className="rounded-lg mb-1 max-w-full max-h-60" />
          )}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className={`text-[9px] text-white/20 mt-0.5 ${isMine ? "mr-2" : "ml-3"}`}>
          {moment(message.created_date).format("h:mm A")}
        </span>
      </div>
    </motion.div>
  );
}
