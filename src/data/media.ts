export type MediaStatus = "idle" | "pending" | "live" | "denied" | "error";

export interface MediaSnapshot {
  mic: MediaStatus;
  camera: MediaStatus;
  screen: MediaStatus;
  micEnabled: boolean;
  cameraEnabled: boolean;
  speaking: boolean;
  level: number;
  error: string | null;
}

const initial: MediaSnapshot = {
  mic: "idle",
  camera: "idle",
  screen: "idle",
  micEnabled: true,
  cameraEnabled: false,
  speaking: false,
  level: 0,
  error: null,
};

let state: MediaSnapshot = initial;
let micStream: MediaStream | null = null;
let cameraStream: MediaStream | null = null;
let screenStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let meterSource: MediaStreamAudioSourceNode | null = null;
let meterFrame: number | null = null;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const emit = (patch: Partial<MediaSnapshot>) => {
  const next = { ...state, ...patch };
  const changed = (Object.keys(next) as Array<keyof MediaSnapshot>).some(
    (key) => next[key] !== state[key],
  );
  if (!changed) {
    return;
  }
  state = next;
  notify();
};

const describeError = (error: unknown, device: "microphone" | "camera") => {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return {
      status: "denied" as MediaStatus,
      message: `Allow ${device} access in your browser to use it.`,
    };
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return {
      status: "error" as MediaStatus,
      message: `No ${device} was found on this device.`,
    };
  }
  if (name === "NotReadableError") {
    return {
      status: "error" as MediaStatus,
      message: `The ${device} is already in use by another app.`,
    };
  }
  return { status: "error" as MediaStatus, message: `Could not start the ${device}.` };
};

const stopMeter = () => {
  if (meterFrame !== null) {
    window.cancelAnimationFrame(meterFrame);
    meterFrame = null;
  }
  meterSource?.disconnect();
  meterSource = null;
  analyser = null;
};

const startMeter = (stream: MediaStream) => {
  stopMeter();
  try {
    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }
    audioContext ??= new AudioContextCtor();
    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }
    meterSource = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    meterSource.connect(analyser);
  } catch {
    stopMeter();
    return;
  }

  const buffer = new Uint8Array(analyser.fftSize);
  const tick = () => {
    if (!analyser || !micStream?.active) {
      stopMeter();
      return;
    }
    analyser.getByteTimeDomainData(buffer);
    let sum = 0;
    for (let index = 0; index < buffer.length; index += 1) {
      const value = (buffer[index] - 128) / 128;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / buffer.length);
    const enabled = state.micEnabled;
    const level = enabled ? Math.min(1, Math.round(rms * 5 * 10) / 10) : 0;
    const speaking = enabled && rms > 0.04;
    emit({ level, speaking });
    meterFrame = window.requestAnimationFrame(tick);
  };
  meterFrame = window.requestAnimationFrame(tick);
};

const setMicTracks = (enabled: boolean) => {
  micStream?.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
};

const setCameraTracks = (enabled: boolean) => {
  cameraStream?.getVideoTracks().forEach((track) => {
    track.enabled = enabled;
  });
};

const ensureMic = async (): Promise<boolean> => {
  if (micStream?.active) {
    return true;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    emit({ mic: "error", error: "Microphone capture is not supported in this browser." });
    return false;
  }

  emit({ mic: "pending", error: null });
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStream = stream;
    setMicTracks(state.micEnabled);
    startMeter(stream);
    emit({ mic: "live", error: null });
    return true;
  } catch (error) {
    const failure = describeError(error, "microphone");
    emit({ mic: failure.status, error: failure.message, speaking: false, level: 0 });
    return false;
  }
};

const ensureCamera = async (): Promise<boolean> => {
  if (cameraStream?.active) {
    return true;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    emit({ camera: "error", error: "Camera capture is not supported in this browser." });
    return false;
  }

  emit({ camera: "pending", error: null });
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    cameraStream = stream;
    setCameraTracks(true);
    emit({ camera: "live", cameraEnabled: true, error: null });
    return true;
  } catch (error) {
    const failure = describeError(error, "camera");
    emit({ camera: failure.status, error: failure.message, cameraEnabled: false });
    return false;
  }
};

const toggleMic = async () => {
  const next = !state.micEnabled;
  if (next && !micStream?.active) {
    const ok = await ensureMic();
    if (!ok) {
      return;
    }
  }
  setMicTracks(next);
  emit(next ? { micEnabled: true } : { micEnabled: false, speaking: false, level: 0 });
};

const setMicEnabled = (enabled: boolean) => {
  setMicTracks(enabled);
  emit(enabled ? { micEnabled: true } : { micEnabled: false, speaking: false, level: 0 });
};

const toggleCamera = async () => {
  const next = !state.cameraEnabled;
  if (next && !cameraStream?.active) {
    const ok = await ensureCamera();
    if (!ok) {
      return;
    }
    setCameraTracks(true);
    emit({ cameraEnabled: true });
    return;
  }
  setCameraTracks(next);
  emit({ cameraEnabled: next });
};

const stopCamera = () => {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  emit({ camera: "idle", cameraEnabled: false });
};

const startScreenShare = async () => {
  if (screenStream?.active) {
    return;
  }
  if (!navigator.mediaDevices?.getDisplayMedia) {
    emit({ screen: "error", error: "Screen sharing is not supported in this browser." });
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenStream = stream;
    emit({ screen: "live", error: null });
    stream.getVideoTracks()[0]?.addEventListener("ended", () => {
      stream.getTracks().forEach((track) => track.stop());
      if (screenStream === stream) {
        screenStream = null;
        emit({ screen: "idle" });
      }
    });
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "NotAllowedError" || name === "AbortError") {
      emit({ screen: "idle" });
      return;
    }
    emit({ screen: "error", error: "Could not start screen sharing." });
  }
};

const stopScreenShare = () => {
  screenStream?.getTracks().forEach((track) => track.stop());
  screenStream = null;
  emit({ screen: "idle" });
};

const toggleScreen = () => {
  if (screenStream?.active) {
    stopScreenShare();
  } else {
    void startScreenShare();
  }
};

const releaseAll = () => {
  stopMeter();
  micStream?.getTracks().forEach((track) => track.stop());
  micStream = null;
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  screenStream?.getTracks().forEach((track) => track.stop());
  screenStream = null;
  void audioContext?.close().catch(() => undefined);
  audioContext = null;
  state = { ...initial };
  notify();
};

export const mediaStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): MediaSnapshot {
    return state;
  },

  getMicStream(): MediaStream | null {
    return micStream;
  },

  getCameraStream(): MediaStream | null {
    return cameraStream;
  },

  getScreenStream(): MediaStream | null {
    return screenStream;
  },

  ensureMic,
  ensureCamera,
  toggleMic,
  setMicEnabled,
  toggleCamera,
  toggleScreen,
  startScreenShare,
  stopScreenShare,
  stopCamera,
  releaseAll,
};
