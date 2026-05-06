// @ts-check

import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import starlightChangelogs, {
  makeChangelogsSidebarLinks,
} from "starlight-changelogs";

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD
    ? "https://www.seafoam-labs.org"
    : "http://localhost:4321",
  integrations: [
    starlight({
      title: "Seafoam Labs",
      logo: {
        src: "./src/assets/images/shellheart-small.webp",
      },
      favicon: "/favicon.png",
      head: [
        {
          tag: "meta",
          attrs: {
            name: "darkreader-lock",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "/og-shellheart.webp",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "twitter:image",
            content: "/og-shellheart.webp",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/favicon.ico",
            sizes: "48x48",
          },
        },
      ],
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
        { slug: "welcome" },
        {
          label: "Shelly ALPM",
          items: [
            "shelly-alpm/overview",
            "shelly-alpm/download",
            "shelly-alpm/config",
            ...makeChangelogsSidebarLinks([
              {
                type: "all",
                base: "shelly-alpm/changelog",
                label: "Changelog",
              },
            ]),
            "shelly-alpm/about",
            {
              label: "Documentation",
              autogenerate: { directory: "shelly-alpm/docs" },
            },
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
      expressiveCode: {
        themes: ["catppuccin-macchiato", "catppuccin-latte"],
      },
      customCss: ["./src/styles/global.css"],
      components: {
        Header: "./src/components/overrides/Header.astro",
        PageTitle: "./src/components/overrides/PageTitle.astro",
        SocialIcons: "./src/components/overrides/SocialIcons.astro",
        Footer: "./src/components/overrides/Footer.astro",
      },
      plugins: [starlightChangelogs()],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
