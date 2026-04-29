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
      sidebar: [],
      customCss: ["./src/styles/global.css"],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
