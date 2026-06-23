import { getContainerRenderer } from "@astrojs/mdx/container-renderer";
import rss, { type RSSFeedItem } from "@astrojs/rss";
import type { APIRoute } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { trailingSlash } from "astro:config/client";
import { loadRenderers } from "astro:container";
import { getCollection, render } from "astro:content";
import { ELEMENT_NODE, transform, walk } from "ultrahtml";
import sanitize from "ultrahtml/transformers/sanitize";
import { isDate } from "../../../../utils/date";

export const GET: APIRoute = async (context) => {
  if (!context.site) {
    throw new Error("Astro config is missing the `site` property.");
  }

  let baseUrl = context.site.href;
  if (baseUrl.at(-1) === "/") baseUrl = baseUrl.slice(0, -1);

  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });

  const posts = (await getCollection("shellyNews")).toSorted((a, b) => {
    const aTime = isDate(a.data.pubDate) ? a.data.pubDate.getTime() : 0;
    const bTime = isDate(b.data.pubDate) ? b.data.pubDate.getTime() : 0;
    return bTime - aTime;
  });

  // See https://github.com/delucis/astro-blog-full-text-rss/blob/latest/src/pages/rss.xml.ts
  const items: RSSFeedItem[] = [];
  for (const post of posts) {
    const { Content } = await render(post);
    const rawContent = await container.renderToString(Content);
    const content = await transform(
      rawContent.replace(/^<!DOCTYPE html>/, ""),
      [
        async (node) => {
          await walk(node, (node) => {
            if (node.type !== ELEMENT_NODE) return;

            if (node.name === "a" && node.attributes.href?.startsWith("/")) {
              node.attributes.href = baseUrl + node.attributes.href;
            } else if (
              node.name === "img" &&
              node.attributes.src?.startsWith("/")
            ) {
              node.attributes.src = baseUrl + node.attributes.src;
            }
          });
          return node;
        },
        sanitize({ dropElements: ["script", "style"] }),
      ],
    );
    items.push({
      ...post.data,
      content,
    });
  }

  return rss({
    items: items,
    title: "Seafoam Labs: Shelly news and updates",
    description:
      "The latest news and updates concerning Shelly users from Seafoam Labs.",
    site: context.site,
    customData: `<language>en-us</language>`,
    trailingSlash: trailingSlash !== "never",
  });
};
