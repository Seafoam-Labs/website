import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";
import { changelogsLoader } from "starlight-changelogs/loader";
import { rssSchema } from "@astrojs/rss";
import { glob } from "astro/loaders";
import { docsLoader } from "@astrojs/starlight/loaders";
import { remoteMarkdownLoader } from "./loaders/remote-markdown";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  remoteDocs: defineCollection({
    loader: remoteMarkdownLoader([
      {
        id: "shelly-cli-reference",
        title: "Shelly CLI Reference",
        url: "https://raw.githubusercontent.com/Seafoam-Labs/Shelly-ALPM/refs/heads/master/wiki/cli_help.md",
      },
    ]),
    schema: z.object({
      title: z.string(),
      sourceUrl: z.url(),
    }),
  }),
  changelogs: defineCollection({
    loader: changelogsLoader([
      {
        provider: "github",
        base: "shelly-alpm/changelog",
        owner: "Seafoam-Labs",
        repo: "Shelly-ALPM",
        title: "Shelly Changelog",
        pagefind: false,
      },
      {
        provider: "github",
        base: "aqueous/changelog",
        owner: "Seafoam-Labs",
        repo: "Aqueous",
        title: "Aqueous Changelog",
        pagefind: false,
      },
      {
        provider: "github",
        base: "starfish/changelog",
        owner: "Seafoam-Labs",
        repo: "Starfish",
        title: "Starfish Changelog",
        pagefind: false,
      },
      {
        provider: "github",
        base: "pori/changelog",
        owner: "Seafoam-Labs",
        repo: "Pori",
        title: "Pori Changelog",
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
