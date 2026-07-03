import { useState, useRef, useEffect } from "react";

export function useStreaming() {
  const [sharing, setSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaName, setMediaName] = useState("");
  const [showMedia, setShowMedia] = useState(false);
  const [viewers, setViewers] = useState(0);
  const screenRef = useRef(null);
  const fileRef = useRef(null);

  // Simulate real-time viewer count when streaming is active
  const isLive = sharing || recording || showMedia;
  useEffect(() => {
    if (!isLive) {
      setViewers(0);
      return;
    }
    setViewers(Math.floor(Math.random() * 20) + 5);
    const t = setInterval(() => {
      setViewers((p) => Math.max(1, p + Math.floor(Math.random() * 7) - 3));
    }, 3000);
    return () => clearInterval(t);
  }, [isLive]);

  const fmtTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaUrl(URL.createObjectURL(file));
    setMediaName(file.name);
    setShowMedia(true);
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      setSharing(true);
      if (screenRef.current) {
        screenRef.current.srcObject = stream;
        screenRef.current.play();
      }
      stream.getVideoTracks()[0].onended = () => setSharing(false);
    } catch {
      setSharing(false);
    }
  };

  const stopScreenShare = () => {
    if (screenRef.current?.srcObject) {
      screenRef.current.srcObject.getTracks().forEach((t) => t.stop());
      screenRef.current.srcObject = null;
    }
    setSharing(false);
  };

  const toggleScreenShare = () =>
    sharing ? stopScreenShare() : startScreenShare();
  const toggleRecording = () => setRecording(!recording);

  return {
    sharing,
    recording,
    recordTime,
    mediaUrl,
    mediaName,
    showMedia,
    screenRef,
    fileRef,
    fmtTime,
    toggleScreenShare,
    toggleRecording,
    handleMediaUpload,
    setShowMedia,
  };
}
