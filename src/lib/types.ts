export type Role = "owner" | "staff";

export type Plan = {
  id: string;
  name: string;
  duration: string;
  price: number;
  original_price: number | null;
  features: string[];
  highlight: boolean;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Trainer = {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  experience_years: number;
  image_url: string | null;
  instagram: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  program: string | null;
  quote: string;
  rating: number;
  result: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

export type Banner = {
  id: string;
  message: string;
  cta_label: string | null;
  cta_href: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export type VideoSource = "upload" | "youtube" | "vimeo" | "mux";
export type Placement = "hero" | "section" | "both";

export type VideoRow = {
  id: string;
  title: string;
  source: VideoSource;
  /** upload: public URL · youtube/vimeo: video id · mux: playback id */
  src: string;
  storage_path: string | null;
  poster_url: string | null;
  tags: string[];
  placement: Placement;
  is_published: boolean;
  is_active: boolean;
  in_playlist: boolean;
  playlist_order: number;
  starts_at: string | null;
  ends_at: string | null;
  schedule_label: string | null;
  headline: string | null;
  subline: string | null;
  created_at: string;
};

export type VideoSettings = {
  id: number;
  playlist_enabled: boolean;
  rotate_seconds: number;
};

export type LeadStatus = "new" | "contacted" | "trial_booked" | "converted" | "lost";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  interest: string | null;
  preferred_time: string | null;
  message: string | null;
  kind: "enquiry" | "free_trial";
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
};

/** Playable video shaped for the frontend player. */
export type PlayerVideo = Pick<
  VideoRow,
  "id" | "title" | "source" | "src" | "poster_url" | "headline" | "subline"
>;

export type VideoSlot = {
  videos: PlayerVideo[]; // 1 = single, >1 = rotating playlist
  rotateSeconds: number;
};
