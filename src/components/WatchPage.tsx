import React, { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";

type VideoItem = {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  uploader: string;
  url: string;
};

export default function WatchPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const currentVideo = videos[currentIndex];
  const nextVideo = videos[currentIndex + 1];

  useEffect(() => {
    fetch("http://18.218.164.106:5000/videos")
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setCurrentIndex(0);
      })
      .catch((err) => console.error("Error fetching videos:", err));
  }, []);

  // AutoPlay countdown logic
  useEffect(() => {
    if (!showAutoPlay) return;

    if (countdown === 0 && nextVideo) {
      setShowAutoPlay(false);
      setCountdown(5);
      setCurrentIndex((i) => i + 1);
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showAutoPlay, countdown, nextVideo]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center py-6 relative overflow-hidden">

      {/* Main container like YouTube */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto flex flex-col lg:flex-row gap-6 px-4">

        {/* LEFT: VIDEO + INFO */}
        <div className="flex-1 flex flex-col">

          {currentVideo ? (
            <>
              {/* ✔ FIXED — PERFECT 16:9 ASPECT RATIO */}
              <div className="relative w-full rounded-xl overflow-hidden bg-black"
                   style={{ aspectRatio: "16 / 9" }}>

                <VideoPlayer
                  video={{
                    url: currentVideo.url,
                    title: currentVideo.title,
                    poster: currentVideo.thumbnail,
                  }}
                  autoPlay
                  key={currentVideo.id}
                  onEnded={() => setShowAutoPlay(true)}
                  className="absolute inset-0 w-full h-full"
                />

                {/* 🕒 AUTOPLAY OVERLAY (like YouTube) */}
                {showAutoPlay && nextVideo && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-20">
                    <img
                      src={nextVideo.thumbnail}
                      className="w-64 h-36 object-cover rounded-lg mb-3"
                    />
                    <p className="text-lg font-semibold">
                      Up Next in {countdown}s
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      {nextVideo.title}
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowAutoPlay(false)}
                        className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => {
                          setShowAutoPlay(false);
                          setCountdown(5);
                          setCurrentIndex((i) => i + 1);
                        }}
                        className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-full text-sm"
                      >
                        Play Now ▶
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 🎬 Video Title + Info */}
              <div className="mt-5 border-t border-white/10 pt-4">
                <h1 className="text-xl font-semibold">{currentVideo.title}</h1>
                <p className="text-sm text-gray-400 mt-1">
                  {currentVideo.views || "1.2K views"} • Uploaded by{" "}
                  <span className="text-pink-400">
                    {currentVideo.uploader || "AIrStream User"}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-400 mt-12 text-center">Loading video...</p>
          )}
        </div>

        {/* RIGHT: UP NEXT SIDEBAR */}
        <div className="w-full lg:w-[380px] flex flex-col">
          <h2 className="text-lg font-semibold mb-3">Up Next</h2>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">

            {videos.slice(currentIndex + 1).map((v, idx) => (
              <div
                key={v.id}
                onClick={() => {
                  setCurrentIndex(currentIndex + 1 + idx);
                  setShowAutoPlay(false);
                  setCountdown(5);
                }}
                className="flex gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition"
              >
                <div className="relative w-40 h-24 flex-shrink-0">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover rounded-lg"
                  />

                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {v.duration || "4:12"}
                  </span>
                </div>

                <div className="flex flex-col justify-between flex-1">
                  <h3 className="text-sm font-medium line-clamp-2">{v.title}</h3>
                  <span className="text-xs text-gray-400">
                    {v.uploader || "AIrStream User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {v.views || "2.3K views"}
                  </span>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}
