import type { Loader } from "astro/loaders";

interface RemoteMarkdownSource {
  id: string;
  url: string;
  slug?: string;
  title?: string;
}

export function remoteMarkdownLoader(sources: RemoteMarkdownSource[]): Loader {
  return {
    name: "remote-markdown-loader",

    // eslint-disable-next-line @typescript-eslint/unbound-method
    async load({ store, logger, renderMarkdown, parseData }) {
      store.clear();

      for (const source of sources) {
        logger.info(`Fetching remote markdown: ${source.url}`);

        const res = await fetch(source.url);
        if (!res.ok) {
          logger.error(
            `Failed to fetch ${source.url}: ${res.status.toString()} ${res.statusText}`,
          );
          continue;
        }

        const markdown = await res.text();

        const rendered = await renderMarkdown(markdown);

        const data = await parseData({
          id: source.id,
          data: {
            title: source.title ?? source.id,
            slug: source.slug ?? source.id,
            sourceUrl: source.url,
            ...rendered.metadata?.frontmatter,
          },
        });

        store.set({
          id: source.id,
          data,
          rendered,
        });
      }
    },
  };
}
