import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dangal Gym, Hyderabad",
    short_name: "Dangal Gym",
    description: "Professional fitness training centre in Mehdipatnam, Hyderabad.",
    start_url: "/",
    display: "standalone",
    background_color: "#111113",
    theme_color: "#111113",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
