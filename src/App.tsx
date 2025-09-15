// src/App.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import UpNextPanel from "./components/UpNextPanel";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import { fmtBytes, fmtDuration, clamp } from "./utils/format";
import { API_URL, LS } from "./utils/constants";
import { AuthProvider } from "./context/AuthContext";
import type { VideoItem } from "./types";

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<"dark" | "neon">(
    () => (localStorage.getItem(LS.THEME) as "dark" | "neon") || "dark"
  );
const [autoplayNext] = useState(true);

  const [watchPos, setWatchPos] = useState<
    Record<string, { t: number; d: number }>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem(LS.WATCHPOS) || "{}");
    } catch {
      return {};
    }
  });

  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Up-Next state
  const [upNextVisible, setUpNextVisible] = useState(false);
  const [upNextCount, setUpNextCount] = useState(5);

  // ---------------- Upload handler ----------------
  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);

     // const response = await fetch(`${API_URL}/videos`, {
		 const response = await fetch("http://localhost:4000/upload", {
       method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");

      const video: VideoItem = await response.json();
      setVideos((prev) => [video, ...prev]);
      setCurrentId(video.id);
      setToast({ message: "Upload successful!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Upload failed!", type: "error" });
    } finally {
      e.target.value = "";
      setUploading(false);
    }
  };

  // ---------------- Fetch videos + restore last ----------------
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_URL}/videos`);
        const data: VideoItem[] = await r.json();
        setVideos(data);

        const savedId = localStorage.getItem("lastVideoId");
        if (savedId && data.some((v) => v.id === savedId)) {
          setCurrentId(savedId);
        } else if (data.length > 0) {
          setCurrentId(data[0].id);
        }
      } catch (e) {
        console.error("Error fetching videos:", e);
      }
    })();
  }, []);

  // ---------------- Persist state ----------------
  useEffect(() => {
    if (currentId) localStorage.setItem("lastVideoId", currentId);
  }, [currentId]);

  useEffect(() => {
    localStorage.setItem(LS.WATCHPOS, JSON.stringify(watchPos));
  }, [watchPos]);

  useEffect(() => {
    localStorage.setItem(LS.THEME, theme);
  }, [theme]);

  // ---------------- Theme ----------------
  const themeCls =
    theme === "dark"
      ? {
          page: "bg-[#0f0f0f] text-[#e5e5e5]",
          panel: "bg-[#181818] border-white/10",
          pill: "bg-[#222]",
          accent: "bg-red-600",
        }
      : {
          page: "bg-slate-950 text-slate-100",
          panel: "bg-slate-900 border-cyan-500/20",
          pill: "bg-slate-800",
          accent: "bg-cyan-400",
        };

  // ---------------- Current video ----------------
  const current = useMemo(
    () => videos.find((v) => v.id === currentId) || null,
    [videos, currentId]
  );

  const currentVideo = useMemo(() => {
    if (!current) return undefined;
    return {
      id: current.id,
      title: current.title || current.filename,
      url: current.url || current.s3_key_hls || "", // ✅ safe fallback
      thumbnail: current.thumbnail,
      thumbnails_base: current.thumbnails_base,
      chapters: current.chapters || [],
      savedPos: watchPos[current.id] || { t: 0, d: current.duration || 0 },
    };
  }, [current, watchPos]);

  // ---------------- Next video ----------------
  const currentIndex = useMemo(
    () => (currentId ? videos.findIndex((v) => v.id === currentId) : -1),
    [videos, currentId]
  );
  const nextVideo = useMemo(() => {
    if (currentIndex < 0 || videos.length === 0) return null;
    const idx = (currentIndex + 1) % videos.length;
    return videos[idx];
  }, [currentIndex, videos]);

  // ---------------- Handle video end ----------------
  const handleEnded = () => {
    if (!autoplayNext || !nextVideo) return;
    setUpNextVisible(true);
    setUpNextCount(5);
  };

  // ---------------- Countdown ----------------
  useEffect(() => {
    if (!upNextVisible || !autoplayNext) return;
    const t = setInterval(() => {
      setUpNextCount((c) => {
        if (c <= 1) {
          clearInterval(t);
          if (nextVideo) {
            setCurrentId(nextVideo.id);
          }
          setUpNextVisible(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [upNextVisible, autoplayNext, nextVideo]);

  // ---------------- JSX ----------------
  return (
    <AuthProvider>
      <div className={theme === "neon" ? "theme-neon" : "theme-dark"}>
        <div className={`min-h-screen ${themeCls.page}`}>
          {!isFullscreen && (
            <Header
              theme={theme}
              setTheme={setTheme}
              q={q}
              setQ={setQ}
              themeCls={themeCls}
              fileInputRef={fileInputRef}
              handleUpload={handleUpload}
              uploading={uploading}
            />
          )}

          <main
            className={`flex w-full ${
              !isFullscreen ? "h-[calc(100vh-64px)]" : "h-screen"
            } px-6 py-4 gap-6`}
          >
            {!isFullscreen && <Sidebar themeCls={themeCls} />}

            {/* Player */}
            <section className="flex-1 flex flex-col min-w-0 relative">
              <div
                className={`rounded-2xl border shadow-lg overflow-hidden ${themeCls.panel} flex-1 flex flex-col`}
              >
                {currentVideo ? (
                  <VideoPlayer
                    video={currentVideo as any}
                    onProgress={(t: number, d: number) =>
                      setWatchPos((w) => ({ ...w, [current!.id!]: { t, d } }))
                    }
                    onFullscreenChange={setIsFullscreen}
                    onEnded={handleEnded}
                  />
                ) : (
                  <div className="p-6">No video selected</div>
                )}
              </div>

              {/* Up Next overlay */}
              {upNextVisible && nextVideo && (
                <div className="absolute right-4 bottom-24 bg-black/80 text-white px-3 py-2 rounded-lg z-50">
                  Up next:{" "}
                  <span className="font-medium">{nextVideo.title}</span> in{" "}
                  {upNextCount}s
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => setUpNextVisible(false)}
                      className="px-2 py-1 bg-white/10 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setCurrentId(nextVideo.id);
                        setUpNextVisible(false);
                      }}
                      className="px-2 py-1 bg-red-600 rounded"
                    >
                      Play now
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Right sidebar */}
            {!isFullscreen && (
              <section className="w-80">
                <UpNextPanel
                  onPlayNext={() => {
                    if (nextVideo) setCurrentId(nextVideo.id);
                    setUpNextVisible(false);
                  }}
                />

                {/* Library */}
                <div
                  className={`rounded-2xl border shadow-lg h-full flex flex-col ${themeCls.panel} p-3 min-w-0`}
                >
                  <h2 className="text-sm opacity-80 mb-2">Library</h2>
                  <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar h-full">
                    {videos.map((v) => {
                      const progress =
                        watchPos[v.id] && watchPos[v.id].d
                          ? clamp(
                              (watchPos[v.id].t || 0) / (watchPos[v.id].d || 1),
                              0,
                              1
                            )
                          : 0;

                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            setCurrentId(v.id);
                            localStorage.setItem("autoPlayNext", "true");
                          }}
                          className={`flex gap-3 p-2 rounded-lg transition ${
                            current?.id === v.id
                              ? "bg-white/10 ring-1 ring-red-500"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <div className="w-28 h-16 bg-black flex-shrink-0 rounded overflow-hidden relative">
                            {v.thumbnail ? (
                              <img
                                src={v.thumbnail}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : v.thumbnails_base ? (
                              <img
                                src={`${v.thumbnails_base}/thumb_0001.jpg`}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800" />
                            )}

                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                              <div
                                className="h-full bg-red-600"
                                style={{ width: `${progress * 100}%` }}
                              />
                            </div>
                            <div className="absolute bottom-1 right-1 text-[10px] bg-black/70 px-1 rounded">
                              {fmtDuration(Number(v.duration))}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div
                              className="text-sm font-medium truncate"
                              title={v.title || v.filename}
                            >
                              {v.title || v.filename}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {fmtBytes(v.size)} •{" "}
                              {(watchPos[v.id]?.t || 0) > 0
                                ? "▶ Resumable"
                                : "New"}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {videos.length === 0 && (
                      <div className="text-sm opacity-70 text-center p-4">
                        No videos available
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </main>

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </div>
    </AuthProvider>
  );
}
