// @ts-check

import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Seafoam Labs",
      logo: {
        src: "./src/assets/images/seafoamlabs-logo.png",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Seafoam-Labs",
        },
        {
          icon: "comment-alt",
          label: "Fluxer",
          href: "https://fluxer.gg/vOjrMXcE",
        },
      ],
      sidebar: [
        {
          label: "Shelly ALPM",
          items: [
            { label: "Overview", link: "/shelly-alpm" },
            "shelly-alpm/download",
            "shelly-alpm/about",
          ],
        },
        {
          label: "Starfish",
          autogenerate: { directory: "starfish" },
        },
        {
          label: "Aqueous",
          autogenerate: { directory: "aqueous" },
        },
      ],
      customCss: ["./src/styles/global.css"],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
