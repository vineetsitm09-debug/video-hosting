import React from "react";

interface Video {
  id: string | number;
  title: string;
  thumbnail: string;
  uploader: string;
  created_at: string;
}

interface Props {
  videos: Video[];
  onSelect: (id: string | number) => void;
}

export default function VideoGrid({ videos, onSelect }: Props) {
  if (!videos || videos.length === 0)
    return (
      <div className="text-center text-gray-400 mt-10">
        No videos found. Upload your first video 🎥
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-3">
      {videos.map((v) => (
        <div
          key={v.id}
          onClick={() => onSelect(v.id)}
          className="cursor-pointer group"
        >
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
            <img
              src={v.thumbnail}
              alt={v.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="mt-2">
            <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-pink-400">
              {v.title}
            </h3>
            <p className="text-gray-400 text-xs">{v.uploader}</p>
            <p className="text-gray-500 text-xs">
              {new Date(v.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
