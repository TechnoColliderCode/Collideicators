import { useEffect, useRef } from "react";

interface StreamVideoProps {
  stream: MediaStream | null;
  className?: string;
  label: string;
}

export function StreamVideo({ stream, className, label }: StreamVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return;
    }
    video.srcObject = stream;
    if (stream) {
      void video.play().catch(() => undefined);
    }
  }, [stream]);

  return (
    <video
      ref={ref}
      className={className}
      aria-label={label}
      autoPlay
      muted
      playsInline
    />
  );
}
