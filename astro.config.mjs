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
        src: "./src/assets/images/shellheart-small.webp",
      },
      social: [
        {
          /* Hack to add fluxer icon via SocialIcons.astro override */
          icon: "warning",
          label: "Buy Me a Coffee",
          href: "https://buymeacoffee.com/zoeyerinba3",
        },
        {
          /* Hack to add fluxer icon via SocialIcons.astro override */
          icon: "warning",
          label: "Fluxer",
          href: "https://fluxer.gg/vOjrMXcE",
        },
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Seafoam-Labs",
        },
      ],
      sidebar: [
        {
          label: "Shelly ALPM",
          items: [
            { label: "Overview", link: "/shelly-alpm" },
            "shelly-alpm/download",
            "shelly-alpm/screenshots",
            "shelly-alpm/docs",
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
      components: {
        SocialIcons: "./src/components/overrides/SocialIcons.astro",
        Footer: "./src/components/overrides/Footer.astro",
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
