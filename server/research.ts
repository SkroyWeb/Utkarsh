// Multi-source research for a topic.
// Sources: several Wikipedia articles (full text, not just the intro) and,
// if TAVILY_API_KEY is set, live web results. Everything is cached for 10 min.
import axios from "axios";

export interface ResearchSource {
  title: string;
  url: string;
  text: string; // plain text, already trimmed
  image?: string; // Wikimedia image URL only
}

export interface Research {
  topic: string;
  sources: ResearchSource[];
  images: string[]; // Wikimedia images the lesson may reference by index
}

const UA = { "User-Agent": "Utkarsh educational app (contact: owner)" };
const cache = new Map<string, { at: number; value: Research }>();
const TTL = 10 * 60 * 1000;

function clean(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const i = cut.lastIndexOf(". ");
  return (i > max * 0.6 ? cut.slice(0, i + 1) : cut).trim();
}

async function wikipediaSources(topic: string, limit = 3): Promise<ResearchSource[]> {
  try {
    const search = await axios.get("https://en.wikipedia.org/w/api.php", {
      params: { action: "query", list: "search", srsearch: topic, srlimit: limit + 2, format: "json" },
      timeout: 5000,
      headers: UA,
    });
    const hits: Array<{ title: string }> = search.data?.query?.search ?? [];
    const titles = hits.map((h) => h.title).slice(0, limit);

    const pages = await Promise.all(
      titles.map(async (title) => {
        try {
          const r = await axios.get("https://en.wikipedia.org/w/api.php", {
            params: {
              action: "query",
              prop: "extracts|pageimages|info",
              titles: title,
              explaintext: 1,
              exsectionformat: "plain",
              piprop: "original",
              inprop: "url",
              redirects: 1,
              format: "json",
            },
            timeout: 6000,
            headers: UA,
          });
          const page: any = Object.values(r.data?.query?.pages ?? {})[0];
          if (!page?.extract) return undefined;
          const img: string | undefined = page.original?.source;
          return {
            title: page.title as string,
            url: (page.fullurl as string) || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
            text: clean(page.extract as string, 5500),
            image: img && img.startsWith("https://upload.wikimedia.org/") ? img : undefined,
          } as ResearchSource;
        } catch {
          return undefined;
        }
      }),
    );
    return pages.filter((p): p is ResearchSource => Boolean(p));
  } catch (e) {
    console.warn("Wikipedia research unavailable:", e instanceof Error ? e.message : e);
    return [];
  }
}

async function tavilySources(topic: string, limit = 4): Promise<ResearchSource[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  try {
    const r = await axios.post(
      "https://api.tavily.com/search",
      { query: topic, max_results: limit, search_depth: "basic" },
      { timeout: 8000, headers: { Authorization: `Bearer ${key}` } },
    );
    const results: Array<{ title?: string; url?: string; content?: string }> = r.data?.results ?? [];
    return results
      .filter((x) => x.url && x.content)
      .map((x) => ({ title: x.title || x.url!, url: x.url!, text: clean(x.content!, 1800) }));
  } catch (e) {
    console.warn("Web search unavailable:", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function gatherResearch(topic: string): Promise<Research> {
  const key = topic.trim().toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;

  const [wiki, web] = await Promise.all([wikipediaSources(topic), tavilySources(topic)]);
  const sources = [...wiki, ...web];
  const images = Array.from(new Set(wiki.map((s) => s.image).filter((x): x is string => Boolean(x))));
  const value: Research = { topic, sources, images };
  if (sources.length) cache.set(key, { at: Date.now(), value });
  return value;
}

/** What /api/search returns: real, distinct sources the user can open. */
export async function searchSources(topic: string) {
  const r = await gatherResearch(topic);
  return r.sources.slice(0, 5).map((s) => ({
    title: s.title,
    url: s.url,
    snippet: clean(s.text, 400),
    image: s.image,
  }));
}
