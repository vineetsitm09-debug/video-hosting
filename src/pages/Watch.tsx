import { useState, useEffect } from "react";
import VideoPlayer from "../components/VideoPlayer";
import UpNextPanel from "../components/UpNextPanel";
import { useParams } from "react-router-dom"; // ✅ add this


type VideoItem = {
  id: string;
  url: string;
  title: string;
  filename?: string;
  size?: number;
  duration?: number;
};

const API_URL = "http://127.0.0.1:8000";

export default function Watch() {
  const { id } = useParams();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [current, setCurrent] = useState<VideoItem | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_URL}/videos`);
        const data: VideoItem[] = await r.json();
        setVideos(data);
        setCurrent(data.find((v) => v.id === id) || null);
      } catch (err) {
        console.error("Failed to fetch videos", err);
      }
    })();
  }, [id]);

  if (!current) return <div className="p-6 text-white">Video not found</div>;

  return (
    <div className="flex w-full h-full gap-6">
      {/* Player */}
      <section className="flex-1 flex flex-col min-w-0">
        <div className="rounded-2xl border shadow-lg overflow-hidden bg-black flex-1 flex flex-col">
          <VideoPlayer video={current} />
        </div>
      </section>

      {/* Right sidebar */}
      <UpNextPanel
        videos={videos}
        currentId={current.id}
        onPlay={(id: string) => (window.location.href = `/watch/${id}`)}
      />
    </div>
  );
}
