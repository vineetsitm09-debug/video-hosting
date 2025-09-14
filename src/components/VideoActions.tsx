import { useState } from "react";
import { Heart } from "lucide-react"; // removed unused MessageCircle

// Explicit prop types
interface VideoActionsProps {
  videoId: string;
  likes: Record<string, number>;
  setLikes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  comments: Record<string, string[]>;
  setComments: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

export default function VideoActions({
  videoId,
  likes,
  setLikes,
  comments,
  setComments,
}: VideoActionsProps) {
  const [commentText, setCommentText] = useState("");

  const handleLike = () => {
    setLikes((prev) => ({
      ...prev,
      [videoId]: (prev[videoId] || 0) + 1,
    }));
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => ({
      ...prev,
      [videoId]: [...(prev[videoId] || []), commentText],
    }));
    setCommentText("");
  };

  return (
    <div className="mt-4 p-4 border-t border-white/10">
      {/* Likes */}
      <button
        onClick={handleLike}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-700 hover:bg-gray-600"
      >
        <Heart className="w-4 h-4 text-red-400" />
        <span>{likes[videoId] || 0} Likes</span>
      </button>

      {/* Comments */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2">Comments</h3>
        <div className="flex gap-2 mb-3">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-1 rounded bg-black/40 border border-white/10 outline-none"
          />
          <button
            onClick={handleComment}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-sm"
          >
            Post
          </button>
        </div>
        <ul className="space-y-2">
          {(comments[videoId] || []).map((c, i: number) => (
            <li
              key={i}
              className="px-3 py-2 rounded bg-white/5 border border-white/10"
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
