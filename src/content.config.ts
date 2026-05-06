import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { changelogsLoader } from "starlight-changelogs/loader";
import { rssSchema } from "@astrojs/rss";
import { glob } from "astro/loaders";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  changelogs: defineCollection({
    // @ts-expect-error - Internally wrong, but it works
    loader: changelogsLoader([
      {
        provider: "github",
        base: "shelly-alpm/changelog",
        owner: "Seafoam-Labs",
        repo: "Shelly-ALPM",
        title: "Shelly Changelog",
        pagefind: false,
      },
    ]),
  }),
  shellyNews: defineCollection({
    schema: rssSchema,
    loader: glob({
      base: "./src/content/news/shelly-alpm/",
      pattern: "**/*.{md,mdx}",
    }),
  }),
};
