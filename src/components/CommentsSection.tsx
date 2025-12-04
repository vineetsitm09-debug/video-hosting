import React, { useState, useEffect } from "react";
import { ThumbsUp, MessageCircle, Send } from "lucide-react";

type Comment = {
  id: number;
  user: string;
  text: string;
  likes: number;
  timeAgo: string;
};

export default function CommentsSection({ videoId }: { videoId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // 🧠 Fetch comments (mock for now)
  useEffect(() => {
    setComments([
      {
        id: 1,
        user: "Priya Sharma",
        text: "Amazing video! Loved the color grading 🔥",
        likes: 22,
        timeAgo: "2 hours ago",
      },
      {
        id: 2,
        user: "Rahul Verma",
        text: "AIrStream UI looks smoother than YouTube 😍",
        likes: 15,
        timeAgo: "5 hours ago",
      },
      {
        id: 3,
        user: "Tech Explorer",
        text: "Would love to see a behind-the-scenes video!",
        likes: 9,
        timeAgo: "1 day ago",
      },
    ]);
  }, [videoId]);

  // ✍️ Handle new comment
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const newItem: Comment = {
      id: Date.now(),
      user: "You",
      text: newComment,
      likes: 0,
      timeAgo: "Just now",
    };
    setComments([newItem, ...comments]);
    setNewComment("");
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">
        Comments • {comments.length}
      </h2>

      {/* ✍️ Input Box */}
      <div className="flex items-start gap-3 mb-6">
        <img
          src="https://i.pravatar.cc/40?u=you"
          alt="user"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a public comment..."
            className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg px-3 py-2 text-white resize-none h-16 focus:ring-2 focus:ring-pink-500 outline-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleAddComment}
              className="bg-pink-600 hover:bg-pink-700 px-4 py-1.5 rounded-full text-sm"
            >
              <Send size={14} className="inline mr-1" /> Comment
            </button>
          </div>
        </div>
      </div>

      {/* 💬 Comments List */}
      <div className="flex flex-col gap-5">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <img
              src={`https://i.pravatar.cc/40?u=${c.user}`}
              alt={c.user}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-white">{c.user}</h4>
              <span className="text-xs text-gray-500">{c.timeAgo}</span>
              <p className="text-sm mt-1 text-gray-200">{c.text}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                <button className="flex items-center gap-1 hover:text-pink-400">
                  <ThumbsUp size={12} /> {c.likes}
                </button>
                <button className="flex items-center gap-1 hover:text-pink-400">
                  <MessageCircle size={12} /> Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
