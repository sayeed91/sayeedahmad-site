import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

// Explorations come from src/content/explorations/*.yaml (edited at /keystatic).
// Compressed videos and posters come from scripts/prepare-videos.mjs.
const videoUrls = import.meta.glob<string>('/src/generated/explorations/*/video-*.mp4', {
  eager: true,
  query: '?url',
  import: 'default',
});
const posters = import.meta.glob<ImageMetadata>('/src/generated/explorations/*/poster.png', {
  eager: true,
  import: 'default',
});
const generated = (slug: string, file: string) => `/src/generated/explorations/${slug}/${file}`;

export type Exploration = {
  slug: string;
  title: string;
  type: string;
  isNew: boolean;
  // Poster frame when there is a video, otherwise the uploaded thumbnail.
  thumb?: ImageMetadata;
  video?: { tile: string; hero: string };
  // A page exists once it has a title and at least one section.
  hasPage: boolean;
  entry: CollectionEntry<'explorations'>;
};

export async function getExplorations(): Promise<Exploration[]> {
  const entries = await getCollection('explorations');
  return entries
    .map((entry) => {
      const d = entry.data;
      const slug = entry.id;
      const tile = videoUrls[generated(slug, 'video-960.mp4')];
      const hero = videoUrls[generated(slug, 'video-1280.mp4')];
      const poster = posters[generated(slug, 'poster.png')];
      const video = d.video && tile && hero ? { tile, hero } : undefined;
      return {
        slug,
        title: d.name,
        type: d.type,
        isNew: d.isNew,
        thumb: video ? poster : (d.thumbnail ?? undefined),
        video,
        hasPage: Boolean(d.pageTitle && d.sections.length),
        entry,
        order: d.order,
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map(({ order, ...x }) => x);
}

// Previous and next wrap around the list; "More explorations" shows the two after it.
export async function explorationNeighbours(slug: string) {
  const all = await getExplorations();
  const i = all.findIndex((x) => x.slug === slug);
  const at = (n: number) => all[(i + n + all.length) % all.length];
  return { prev: at(-1), next: at(1), more: [at(1), at(2)] };
}

// Body text: an empty line starts a new paragraph, "- " lines form a bullet list.
export type Block = { kind: 'p'; text: string } | { kind: 'ul'; items: string[] };
export function parseBody(body: string): Block[] {
  return body
    .trim()
    .split(/\n\s*\n/)
    .flatMap((chunk): Block[] => {
      const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
      const blocks: Block[] = [];
      for (const line of lines) {
        const bullet = line.match(/^[-•]\s+(.*)$/);
        const last = blocks.at(-1);
        if (bullet) {
          if (last?.kind === 'ul') last.items.push(bullet[1]);
          else blocks.push({ kind: 'ul', items: [bullet[1]] });
        } else if (last?.kind === 'p') last.text += ' ' + line;
        else blocks.push({ kind: 'p', text: line });
      }
      return blocks;
    });
}
