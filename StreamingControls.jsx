import React from "react";
import { Monitor, MonitorOff, Film, Circle, Square } from "lucide-react";

export default function StreamingControls({ streaming, baseClass, idleClass }) {
  const {
    sharing,
    recording,
    toggleScreenShare,
    toggleRecording,
    fileRef,
    handleMediaUpload,
  } = streaming;

  return (
    <>
      <button
        onClick={toggleScreenShare}
        className={`${baseClass} ${sharing ? "bg-indigo-500 text-white" : idleClass}`}
        title="Share Screen"
      >
        {sharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className={`${baseClass} ${idleClass}`}
        title="Play Media File"
      >
        <Film size={18} />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="video/*,audio/*"
        className="hidden"
        onChange={handleMediaUpload}
      />
      <button
        onClick={toggleRecording}
        className={`${baseClass} ${recording ? "bg-red-500 text-white" : idleClass}`}
        title="Record"
      >
        {recording ? <Square size={16} /> : <Circle size={18} />}
      </button>
    </>
  );
}
