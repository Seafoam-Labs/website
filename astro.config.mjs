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
      editLink: {
        baseUrl: "https://github.com/Seafoam-Labs/website/edit/main/",
      },
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
            "shelly-alpm/about",
            ...makeChangelogsSidebarLinks([
              {
                type: "all",
                base: "shelly-alpm/changelog",
                label: "Changelog",
              },
            ]),
            {
              label: "Documentation",
              items: [
                { autogenerate: { directory: "shelly-alpm/docs" } },
                {
                  link: "shelly-alpm/docs/cli-reference/",
                  label: "CLI Reference",
                },
              ],
            },
          ],
        },
        {
          label: "Starfish",
          items: [
            { autogenerate: { directory: "starfish" } },
            ...makeChangelogsSidebarLinks([
              {
                type: "all",
                base: "starfish/changelog",
                label: "Changelog",
              },
            ]),
          ],
        },
        {
          label: "Aqueous",
          items: [
            { autogenerate: { directory: "aqueous" } },
            ...makeChangelogsSidebarLinks([
              {
                type: "all",
                base: "aqueous/changelog",
                label: "Changelog",
              },
            ]),
          ],
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
