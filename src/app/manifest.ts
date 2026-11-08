import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dangal Gym, Hyderabad",
    short_name: "Dangal Gym",
    description: "Professional fitness training centre in Mehdipatnam, Hyderabad.",
    start_url: "/",
    display: "standalone",
    background_color: "#14213D",
    theme_color: "#14213D",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
