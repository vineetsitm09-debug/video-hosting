import VideoPlayerPro from "@/components/VideoPlayerPro";

export default function Demo() {
  const video = {
    url: "http://18.218.164.106:5000/hls/1733922000/master.m3u8",
    poster: "/thumbs/poster.jpg",
    subtitles: [
      { label: "English", url: "/subs/en.vtt", lang: "en" },
      { label: "Hindi", url: "/subs/hi.vtt", lang: "hi" },
    ],
  };

  return (
    <div className="p-6">
      <VideoPlayerPro video={video} autoPlay />
    </div>
  );
}
