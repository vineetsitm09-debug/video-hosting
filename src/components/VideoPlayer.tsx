// src/components/VideoPlayer.tsx (Final Production Version with UX Features)

import { useEffect, useRef, useState, useCallback } from "react";
import Hls, { type Level } from "hls.js";
import {
    Play, Pause, Volume2, VolumeX,
    SkipBack, SkipForward, Maximize2, Minimize2, Settings, Loader2
} from "lucide-react";

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

const fmtDuration = (sec?: number) => {
    if (!sec && sec !== 0) return "-";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return h > 0
        ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
        : `${m}:${s.toString().padStart(2, "0")}`;
};

type VideoMeta = {
    url: string;
    title?: string;
    thumbnails_base?: string;
};

type PlayerProps = {
    video: VideoMeta;
    onProgress?: (t: number, d: number) => void;
    onFullscreenChange?: (fs: boolean) => void;
    onEnded?: () => void;
};

export default function VideoPlayer({
    video,
    onProgress,
    onFullscreenChange,
    onEnded,
}: PlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const lastClickTime = useRef(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false); // NEW STATE: Buffering
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const [hoverPct, setHoverPct] = useState<number | null>(null);
    const [hoverTime, setHoverTime] = useState<number | null>(null);

    const [levels, setLevels] = useState<Level[]>([]);
    const [currentLevel, setCurrentLevel] = useState<number | "auto">("auto");
    const [settingsOpen, setSettingsOpen] = useState(false);

    const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-hide controls logic
    const resetHideTimer = () => {
        setShowControls(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
    };

    const pauseHideTimer = () => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };

    // Actions (wrapped in useCallback for use in effects and keybindings)
    const togglePlay = useCallback(async () => {
        const el = videoRef.current;
        if (!el) return;
        if (el.paused) await el.play();
        else el.pause();
    }, []);

    const seekBy = useCallback((d: number) => {
        const el = videoRef.current;
        if (!el) return;
        el.currentTime = clamp(el.currentTime + d, 0, duration || 0);
    }, [duration]);

    const toggleMute = useCallback(() => {
        const el = videoRef.current;
        if (!el) return;
        const m = !isMuted;
        el.muted = m;
        setIsMuted(m);
    }, [isMuted]);

    const toggleFullscreen = useCallback(async () => {
        const wrapper = videoRef.current?.parentElement;
        if (!wrapper) return;
        if (!document.fullscreenElement) await wrapper.requestFullscreen();
        else await document.exitFullscreen();
        setIsFullscreen(Boolean(document.fullscreenElement));
    }, []);

    const changeQuality = (level: number | "auto") => {
        if (!hlsRef.current) return;
        if (level === "auto") {
            hlsRef.current.currentLevel = -1; // auto
        } else {
            hlsRef.current.currentLevel = level;
        }
        setCurrentLevel(level);
        setSettingsOpen(false);
    };

    // --- NEW FEATURE: Double-Click Seeking Handler ---
    const handleVideoClick = useCallback((e: React.MouseEvent) => {
        const el = videoRef.current;
        if (!el) return;

        // 1. Double-click logic
        const now = Date.now();
        if (now - lastClickTime.current < 300) { // Check for double-click within 300ms
            e.preventDefault();
            e.stopPropagation();

            const rect = el.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            
            // If click is on the left half of the player
            if (clickX < rect.width / 2) {
                seekBy(-10); // Seek back 10 seconds
            } else {
                seekBy(10); // Seek forward 10 seconds
            }

            // Reset the double-click check to prevent triple/quadruple clicks
            lastClickTime.current = 0; 
            return;
        }

        // 2. Single-click logic (Toggle Play/Pause)
        lastClickTime.current = now;
        togglePlay();

    }, [seekBy, togglePlay]);
    
    // ---- Load video (Main Effect) ----
    useEffect(() => {
        const el = videoRef.current;
        if (!el || !video) return;

        hlsRef.current?.destroy(); 
        
        if (!video.url.endsWith(".m3u8")) {
            el.src = video.url;
            el.play().catch(() => {});
            return;
        }

        // HLS logic remains...
        if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hlsRef.current = hls;
            hls.loadSource(video.url);
            hls.attachMedia(el);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setLevels(hls.levels);
                setCurrentLevel("auto");
                el.play().catch(() => {});
            });

            return () => hls.destroy();
        } else {
            el.src = video.url;
            el.play().catch(() => {});
        }
    }, [video?.url]);

    // Sync volume
    useEffect(() => {
        if (videoRef.current) videoRef.current.volume = volume;
    }, [volume]);

    // Media events and Buffering Logic
    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;

        const onLoaded = () => setDuration(el.duration || 0);
        const onTime = () => {
            setCurrentTime(el.currentTime);
            setDuration(el.duration || 0);
            try {
                const endIdx = el.buffered?.length ? el.buffered.length - 1 : 0;
                const b = el.buffered?.length ? el.buffered.end(endIdx) : 0;
                setBuffered(b);
            } catch {}
            onProgress?.(el.currentTime, el.duration || 0);
        };
        const onPlay = () => { setIsPlaying(true); setIsBuffering(false); };
        const onPause = () => setIsPlaying(false);
        const onEnd = () => onEnded?.();
        
        // NEW BUFFFERING LOGIC
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => setIsBuffering(false);

        el.addEventListener("loadedmetadata", onLoaded);
        el.addEventListener("timeupdate", onTime);
        el.addEventListener("play", onPlay);
        el.addEventListener("pause", onPause);
        el.addEventListener("ended", onEnd);
        el.addEventListener("waiting", onWaiting); // Added
        el.addEventListener("playing", onPlaying); // Added

        return () => {
            el.removeEventListener("loadedmetadata", onLoaded);
            el.removeEventListener("timeupdate", onTime);
            el.removeEventListener("play", onPlay);
            el.removeEventListener("pause", onPause);
            el.removeEventListener("ended", onEnd);
            el.removeEventListener("waiting", onWaiting); // Cleanup
            el.removeEventListener("playing", onPlaying); // Cleanup
        };
    }, [onProgress, onEnded]);

    // Fullscreen event listener
    useEffect(() => {
        const handleFs = () => {
            const fs = !!document.fullscreenElement;
            setIsFullscreen(fs);
            onFullscreenChange?.(fs);
        };
        document.addEventListener("fullscreenchange", handleFs);
        return () => document.removeEventListener("fullscreenchange", handleFs);
    }, [onFullscreenChange]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
                return;
            }

            const el = videoRef.current;
            if (!el) return;

            switch (e.key) {
                case ' ':
                case 'k': 
                    e.preventDefault(); 
                    togglePlay();
                    break;
                case 'ArrowLeft': 
                    e.preventDefault(); 
                    seekBy(-5); // Seek 5 seconds
                    break;
                case 'ArrowRight':
                    e.preventDefault(); 
                    seekBy(5); // Seek 5 seconds
                    break;
                case 'm': 
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'f': 
                    e.preventDefault();
                    toggleFullscreen();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [togglePlay, seekBy, toggleMute, toggleFullscreen]);


    // Derived state
    const progressPct = duration ? (currentTime / duration) * 100 : 0;
    const bufferedPct = duration ? (buffered / duration) * 100 : 0;

    return (
        <div
            className="relative bg-black h-full flex flex-col group"
            onMouseMove={resetHideTimer}
        >
            <video
                ref={videoRef}
                className="w-full h-full"
                playsInline
                controls={false}
                preload="metadata"
                onClick={handleVideoClick} // Use the custom handler
                key={video.url} 
            />

            {/* Overlay Play Button */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button
                        className="w-20 h-20 bg-black/50 rounded-full grid place-items-center pointer-events-auto"
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePlay();
                        }}
                    >
                        <Play className="w-10 h-10 text-white" />
                    </button>
                </div>
            )}
            
            {/* NEW FEATURE: Buffering Spinner */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
            )}

            {/* Controls */}
            <div
                onMouseEnter={pauseHideTimer} 
                onMouseLeave={resetHideTimer} 
                className={`absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/80 to-transparent z-40 transition-opacity duration-500 ${
                    showControls ? "opacity-100" : "opacity-0"
                }`}
            >
                {/* Progress Bar with Thumbnails */}
                <div className="relative w-full group h-5 mb-2 flex items-center">
                    <div
                        className="absolute h-1.5 bg-white/30 rounded-full"
                        style={{ width: `${bufferedPct}%` }}
                    />
                    <div
                        className="absolute h-1.5 rounded-full bg-red-600"
                        style={{ width: `${progressPct}%` }}
                    />
                    <input
                        type="range"
                        min={0}
                        max={1000}
                        value={duration ? Math.floor((currentTime / duration) * 1000) : 0}
                        onChange={(e) => {
                            const pct = Number(e.target.value) / 1000;
                            if (videoRef.current) videoRef.current.currentTime = (duration || 0) * pct;
                        }}
                        onMouseMove={(e) => {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            const pct = clamp((e.clientX - rect.left) / rect.width);
                            setHoverPct(pct);
                            setHoverTime(pct * (duration || 0));
                        }}
                        onMouseLeave={() => {
                            setHoverPct(null);
                            setHoverTime(null);
                        }}
                        className="w-full appearance-none bg-transparent cursor-pointer relative"
                    />

                    {/* Hover Thumbnail Preview */}
                    {hoverPct !== null && hoverTime !== null && video?.thumbnails_base && (
                        <div
                            className="absolute -top-36 flex flex-col items-center pointer-events-none"
                            style={{ left: `${hoverPct * 100}%`, transform: "translateX(-50%)" }}
                        >
                            <img
                                src={`${video.thumbnails_base}/thumb_${String(
                                    Math.floor(hoverTime / 5) + 1
                                ).padStart(4, "0")}.jpg`}
                                alt="preview"
                                className="w-40 h-24 object-cover rounded-lg shadow-xl border border-white/30"
                            />
                            <span className="text-xs text-white bg-black/80 px-2 py-0.5 rounded mt-1">
                                {fmtDuration(hoverTime)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between text-white relative">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay}>{isPlaying ? <Pause /> : <Play />}</button>
                        <button onClick={() => seekBy(-10)}><SkipBack /></button>
                        <button onClick={() => seekBy(10)}><SkipForward /></button>

                        {/* Volume */}
                        <div className="flex items-center gap-2">
                            <button onClick={toggleMute}>
                                {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={isMuted ? 0 : Math.round(volume * 100)}
                                onChange={(e) => {
                                    const val = Number(e.target.value) / 100;
                                    setVolume(val);
                                    setIsMuted(val === 0);
                                }}
                                className="w-24 h-1 bg-gray-500 rounded-lg cursor-pointer"
                            />
                        </div>

                        <span className="text-sm font-mono">
                            {fmtDuration(currentTime)} / {fmtDuration(duration)}
                        </span>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-3">
                        {/* Settings (Quality) */}
                        <div className="relative">
                            <button onClick={() => setSettingsOpen((s) => !s)}>
                                <Settings />
                            </button>
                            {settingsOpen && (
                                <div className="absolute bottom-10 right-0 bg-black/90 border border-white/20 rounded-lg shadow-lg p-2 text-sm z-50">
                                    <button
                                        onClick={() => changeQuality("auto")}
                                        className={`block w-full text-left px-3 py-1 rounded ${
                                            currentLevel === "auto" ? "bg-red-600" : "hover:bg-white/10"
                                        }`}
                                    >
                                        Auto
                                    </button>
                                    {levels.map((lvl, i) => (
                                        <button
                                            key={i}
                                            onClick={() => changeQuality(i)}
                                            className={`block w-full text-left px-3 py-1 rounded ${
                                                currentLevel === i ? "bg-red-600" : "hover:bg-white/10"
                                            }`}
                                        >
                                            {lvl.height}p
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={toggleFullscreen}>
                            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
