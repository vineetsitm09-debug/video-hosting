// src/types.ts

export type CaptionTrack = {
  src: string;
  label: string;
  lang: string;
  default?: boolean;
};

export type Chapter = {
  time: number;
  title: string;
};

export type VideoItem = {
  id: string;
  url: string;
  title?: string;
  filename?: string;

  // Dates
  createdAt?: string; // frontend-friendly camelCase
  updatedAt?: string | null;
  created_at?: string; // keep backend snake_case if API returns this
  updated_at?: string | null;

  // Media Info
  size?: number;
  duration?: number | string; // can be raw seconds or formatted "06:32"
  thumbnailUrl?: string; // explicit field for UI
  thumbnail?: string; // fallback if API only provides "thumbnail"
  poster?: string;

  // Metadata
  captions?: CaptionTrack[];
  chapters?: Chapter[];
  status?: string;

  // Storage keys
  s3_key_original?: string;
  s3_key_hls?: string | null;
  s3_key_thumbnail?: string | null;

  // Generated thumbnail sets
  thumbnails_base?: string;
};
