import type { MetadataRoute } from "next";

const description =
  "Paintball Méditerranée propose des parties encadrées, des événements privés et du team building sur la côte méditerranéenne.";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paintball Méditerranée",
    short_name: "Paintball Med",
    description,
    start_url: "/",
    lang: "fr",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#036672",
    icons: [
      {
        src: "/icons/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
