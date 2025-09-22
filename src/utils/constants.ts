// src/utils/constants.ts

//export const API_URL = "http://127.0.0.1:8000";
// Use your EC2 server, NOT localhost
export const API_URL = "http://18.218.164.106:5000";  // or 4000 if you switched
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
