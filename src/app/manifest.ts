import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Go-Train - Your Fitness Journey",
    short_name: "Go-Train",
    description:
      "Track workouts, analyze progress, and achieve your fitness goals with intelligent training.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/gymguywomen.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/gymguywomen.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/gym-mobile-screenshot.png",
        sizes: "1170x2532",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/GymImage.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
      },
    ],
    categories: ["fitness", "health", "lifestyle"],
  };
}
