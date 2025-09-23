// src/utils/constants.ts

// Use environment variable in production, fallback to localhost for local dev
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const VIDEOS_ENDPOINT = `${API_URL}/videos`;
export const UPLOAD_ENDPOINT = `${API_URL}/upload`;

export const LS = {
  LIKES: "vh_likes_v1",
  COMMENTS: "vh_comments_v1",
  THEME: "vh_theme_v1",
  VOLUME: "vh_volume_v1",
  SPEED: "vh_speed_v1",
  AUTOPLAY_NEXT: "vh_autoplay_next_v1",
  WATCHPOS: "vh_watchpos_v1",
};
