// src/components/UpNextPanel.tsx
import React from "react";
import type { VideoItem } from "../types";
import { Play } from "lucide-react";

interface UpNextPanelProps {
  videos: VideoItem[];
  currentId: string | null;
  onPlay: (id: string) => void;
}

export default function UpNextPanel({ videos, currentId, onPlay }: UpNextPanelProps) {
  if (!videos || videos.length === 0) return null;

  return (
    <aside className="w-80 hidden lg:block border-l border-white/10 
                      theme-dark:bg-black/90 theme-neon:bg-[rgba(20,20,40,0.9)] 
                      overflow-y-auto custom-scrollbar rounded-2xl shadow-md">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3 text-white neon-glow">Up Next</h2>
        <ul className="space-y-3">
          {videos.map((video) => {
            const isActive = video.id === currentId;
            return (
              <li
                key={video.id}
                onClick={() => onPlay(video.id)}
                className={`group flex gap-3 p-2 rounded-lg cursor-pointer transition-colors
                  ${isActive
                    ? "bg-white/10 border-l-4 border-red-500 shadow-[0_0_10px_rgba(229,9,20,0.6)]"
                    : "hover:bg-white/5"}`}
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  <img
                    src={video.thumbnail || "/placeholder.png"}
                    alt={video.title || video.filename}
                    className="w-36 h-20 object-cover rounded-md group-hover:opacity-90"
                  />
                  {/* Duration Tag */}
                  {video.duration && (
                    <span className="absolute bottom-1 right-1 text-xs bg-black/80 text-white px-1 rounded">
                      {video.duration}
                    </span>
                  )}
                  {/* Play Overlay when Active */}
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between flex-1 overflow-hidden">
                  <h3 className="text-sm font-medium text-white truncate">
                    {video.title || video.filename}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {new Date(video.createdAt || 0).toLocaleDateString()}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
