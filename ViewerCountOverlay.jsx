import React from "react";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function ViewerCountOverlay({ count, className = "" }) {
  if (!count) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute bottom-3 left-3 bg-red-500/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg z-10 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      <Eye size={12} className="text-white" />
      <span className="text-white text-xs font-semibold">{count} watching</span>
    </motion.div>
  );
}
