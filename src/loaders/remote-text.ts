import type { Loader } from "astro/loaders";

interface RemoteTextSource {
  id: string;
  url: string;
  title?: string;
  /**
   * Language identifier used for syntax highlighting (e.g. "toml", "yaml").
   * Omit to render as plain text.
   */
  language?: string;
}

/**
 * Picks a code-fence length that cannot collide with backtick runs present in
 * the content, so arbitrary text can be embedded safely as a fenced block.
 */
function fenceFor(text: string): string {
  const longest = Math.max(
    0,
    ...Array.from(text.matchAll(/`+/g), (m) => m[0].length),
  );
  return "`".repeat(Math.max(3, longest + 1));
}

export function remoteTextLoader(sources: RemoteTextSource[]): Loader {
  return {
    name: "remote-text-loader",

    // eslint-disable-next-line @typescript-eslint/unbound-method
    async load({ store, logger, renderMarkdown, parseData }) {
      store.clear();

      for (const source of sources) {
        logger.info(`Fetching remote text: ${source.url}`);

        const res = await fetch(source.url);
        if (!res.ok) {
          logger.error(
            `Failed to fetch ${source.url}: ${res.status.toString()} ${res.statusText}`,
          );
          continue;
        }

        const text = await res.text();

        // Wrap the raw text in a fenced code block so it renders with syntax
        // highlighting through the same markdown pipeline as remoteMarkdownLoader.
        const fence = fenceFor(text);
        const info = source.language ?? "";
        const markdown = `${fence}${info}\n${text}\n${fence}`;

        const rendered = await renderMarkdown(markdown);

        const data = await parseData({
          id: source.id,
          data: {
            title: source.title ?? source.id,
            sourceUrl: source.url,
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
