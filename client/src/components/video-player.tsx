import React, { useRef, useState, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  videoUrl: string;
}

const SPEEDS = [0.75, 1, 1.25, 1.5];
const SPEED_KEY = "ai-teacher-speed";

type FullscreenDoc = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FullscreenEl = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDoc;
  return doc.fullscreenElement || doc.webkitFullscreenElement || null;
}

function loadSpeed(): number {
  try {
    const saved = Number(localStorage.getItem(SPEED_KEY));
    return SPEEDS.includes(saved) ? saved : 1;
  } catch {
    return 1;
  }
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [speed, setSpeed] = useState<number>(loadSpeed);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isVideoContent, setIsVideoContent] = useState(false);
  const [isSvgContent, setIsSvgContent] = useState(false);

  // Latest values for use inside long-lived listeners.
  const speedRef = useRef(speed);
  const mutedRef = useRef(isMuted);
  speedRef.current = speed;
  mutedRef.current = isMuted;

  const toggleFullscreenRef = useRef<() => void>(() => {});

  const sendIframeCommand = useCallback(
    (type: string, payload: Record<string, unknown> = {}) => {
      iframeRef.current?.contentWindow?.postMessage(
        { source: "ai-teacher-player", type, ...payload },
        window.location.origin,
      );
    },
    [],
  );

  useEffect(() => {
    const isStream = videoUrl.includes("/api/videos/stream/");
    const isNativeVideo =
      videoUrl.endsWith(".mp4") || videoUrl.endsWith(".webm");

    setIsSvgContent(isStream);
    setIsVideoContent(isNativeVideo);
    // The HTML lesson reports its own ready state; native video waits for metadata.
    setLoading(isNativeVideo);
    setError(false);
    setCurrentTime(0);
    setIsPlaying(false);

    const handleMessage = (event: MessageEvent) => {
      if (!isStream || event.source !== iframeRef.current?.contentWindow)
        return;
      if (event.data?.source !== "ai-teacher-video") return;
      const data = event.data;

      if (data.type === "toggle-fullscreen") {
        toggleFullscreenRef.current();
        return;
      }

      if (typeof data.duration === "number" && data.duration > 0) {
        setDuration(data.duration);
      }
      if (typeof data.currentTime === "number") {
        setCurrentTime(data.currentTime);
      }
      if (typeof data.playing === "boolean") setIsPlaying(data.playing);
      if (typeof data.muted === "boolean") setIsMuted(data.muted);
      if (typeof data.captions === "boolean") setCaptionsOn(data.captions);
      if (typeof data.speed === "number") {
        setSpeed(data.speed);
        if (data.type !== "ready" && data.speed !== speedRef.current) {
          try {
            localStorage.setItem(SPEED_KEY, String(data.speed));
          } catch {
            /* ignore */
          }
        }
      }

      if (data.type === "ready") {
        // Re-apply the viewer's saved preferences to a freshly loaded lesson.
        if (speedRef.current !== 1) {
          iframeRef.current?.contentWindow?.postMessage(
            { source: "ai-teacher-player", type: "set-speed", speed: speedRef.current },
            window.location.origin,
          );
        }
        if (mutedRef.current) {
          iframeRef.current?.contentWindow?.postMessage(
            { source: "ai-teacher-player", type: "set-muted", muted: true },
            window.location.origin,
          );
        }
      }
      setLoading(false);
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [videoUrl]);

  // Track fullscreen on the wrapper (not the iframe) so our controls stay visible.
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(getFullscreenElement() === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Leaving the page (or swapping videos) while fullscreen should not strand the UI.
  useEffect(() => {
    return () => {
      if (getFullscreenElement() === containerRef.current) {
        void document.exitFullscreen?.();
      }
    };
  }, []);

  const togglePlay = () => {
    if (isVideoContent && videoRef.current) {
      if (videoRef.current.paused) {
        void videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      return;
    }
    if (isSvgContent) sendIframeCommand(isPlaying ? "pause" : "play");
  };

  const restart = () => {
    if (isVideoContent && videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play();
    } else if (isSvgContent) {
      sendIframeCommand("restart");
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (isVideoContent && videoRef.current) {
      videoRef.current.muted = next;
    } else if (isSvgContent) {
      sendIframeCommand("set-muted", { muted: next });
    }
  };

  const changeSpeed = (next: number) => {
    setSpeed(next);
    try {
      localStorage.setItem(SPEED_KEY, String(next));
    } catch {
      /* private mode: just don't persist */
    }
    if (isVideoContent && videoRef.current) {
      videoRef.current.playbackRate = next;
    } else if (isSvgContent) {
      sendIframeCommand("set-speed", { speed: next });
    }
  };

  const toggleCaptions = () => {
    if (isSvgContent) sendIframeCommand("toggle-captions");
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current as FullscreenEl | null;
    if (!container) return;
    const doc = document as FullscreenDoc;

    try {
      if (getFullscreenElement()) {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else await doc.webkitExitFullscreen?.();
      } else if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        await container.webkitRequestFullscreen();
      } else {
        // iPhone Safari cannot fullscreen arbitrary elements: fill the viewport instead.
        setIsFullscreen((prev) => !prev);
      }
    } catch (err) {
      console.error("Fullscreen failed:", err);
      setIsFullscreen((prev) => !prev);
    }
  };

  toggleFullscreenRef.current = () => void toggleFullscreen();

  const seekTo = (time: number) => {
    const nextTime = Math.max(0, Math.min(duration, time));
    setCurrentTime(nextTime);
    if (isVideoContent && videoRef.current) {
      videoRef.current.currentTime = nextTime;
    } else if (isSvgContent) {
      sendIframeCommand("seek", { time: nextTime, resume: isPlaying });
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const total = Math.max(0, Math.floor(timeInSeconds));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // iPhone-style "pseudo fullscreen": no Fullscreen API available but isFullscreen is on.
  const pseudoFullscreen =
    isFullscreen && getFullscreenElement() !== containerRef.current;

  const iconBtn = "shrink-0 focus:outline-none p-1 rounded hover:bg-white/20 transition-colors";

  return (
    <div
      ref={containerRef}
      className={
        pseudoFullscreen
          ? "fixed inset-0 z-[9999] bg-gray-900"
          : "absolute inset-0 bg-gray-900"
      }
    >
      {isVideoContent ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          playsInline
          autoPlay
          onLoadedMetadata={() => {
            const nativeDuration = videoRef.current?.duration;
            if (nativeDuration && Number.isFinite(nativeDuration)) {
              setDuration(nativeDuration);
            }
            if (videoRef.current) videoRef.current.playbackRate = speed;
            setLoading(false);
          }}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      ) : isSvgContent ? (
        <iframe
          ref={iframeRef}
          src={videoUrl}
          className="w-full h-full"
          style={{ border: "none" }}
          title="AI Teacher Video"
          allow="autoplay; fullscreen"
          allowFullScreen
          onLoad={() => sendIframeCommand("get-state")}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-white">
          <div className="text-center">
            <span className="material-icons text-6xl mb-4">smart_display</span>
            <p>Video content type not supported</p>
          </div>
        </div>
      )}

      {/* Loading / error overlays sit on top so the media element still mounts. */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-white flex flex-col items-center">
            <div className="animate-spin mb-4">
              <span className="material-icons text-4xl">sync</span>
            </div>
            <p>Loading video content...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center p-4">
            <span className="material-icons text-red-500 text-4xl mb-2">
              error_outline
            </span>
            <p className="mb-2">Sorry, there was an error loading the video.</p>
            <button
              className="bg-primary text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Lessons (iframe) use their own themed controls; this bar is for plain video files. */}
      {!isSvgContent && (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 sm:px-4 sm:pb-3 z-20">
        <div className="flex items-center gap-1 sm:gap-2 text-white">
          <button
            className={iconBtn}
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <span className="material-icons">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          <button className={iconBtn} onClick={restart} aria-label="Restart">
            <span className="material-icons">replay</span>
          </button>

          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={Math.min(currentTime, duration)}
            onChange={(event) => seekTo(Number(event.target.value))}
            aria-label="Video timeline"
            className="flex-grow mx-1 accent-primary cursor-pointer min-w-0"
          />

          <span className="text-xs sm:text-sm whitespace-nowrap tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Lesson speed lives in the settings (gear) menu; native video has no such menu. */}
          {isVideoContent && (
          <select
            value={speed}
            onChange={(event) => changeSpeed(Number(event.target.value))}
            aria-label="Playback speed"
            className="bg-black/50 text-white text-xs sm:text-sm rounded px-1 py-1 border border-white/30 focus:outline-none cursor-pointer"
          >
            {SPEEDS.map((value) => (
              <option key={value} value={value} className="text-black">
                {value}x
              </option>
            ))}
          </select>
          )}

          {isSvgContent && (
            <>
              <button
                className={`${iconBtn} ${captionsOn ? "" : "opacity-50"}`}
                onClick={toggleCaptions}
                aria-label="Captions"
                aria-pressed={captionsOn}
              >
                <span className="material-icons">
                  {captionsOn ? "closed_caption" : "closed_caption_disabled"}
                </span>
              </button>
              <button
                className={iconBtn}
                onClick={() => sendIframeCommand("toggle-settings")}
                aria-label="Teacher and voice settings"
              >
                <span className="material-icons">settings</span>
              </button>
            </>
          )}

          <button
            className={iconBtn}
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <span className="material-icons">
              {isMuted ? "volume_off" : "volume_up"}
            </span>
          </button>

          <button
            className={iconBtn}
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <span className="material-icons">
              {isFullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
