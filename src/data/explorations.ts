import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

// Explorations come from src/content/explorations/*.yaml (edited at /keystatic).
// Compressed videos and posters come from scripts/prepare-videos.mjs.
const videoUrls = import.meta.glob<string>('/src/generated/explorations/*/*.mp4', {
  eager: true,
  query: '?url',
  import: 'default',
});
const posters = import.meta.glob<ImageMetadata>('/src/generated/explorations/*/*-poster.png', {
  eager: true,
  import: 'default',
});
const generated = (slug: string, file: string) => `/src/generated/explorations/${slug}/${file}`;

// Must match videoKey() in scripts/prepare-videos.mjs.
export const videoKey = (path: string, slug: string, speed = 1) =>
  path
    .replace(new RegExp(`^.*?explorations/${slug}/`), '')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-') + (speed !== 1 ? `-x${String(speed).replace('.', '_')}` : '');

// The compressed files for one uploaded video, if the script has made them.
export function videoFiles(slug: string, path: string, speed?: number | null) {
  const key = videoKey(path, slug, Number(speed) || 1);
  return {
    page: videoUrls[generated(slug, `${key}-1280.mp4`)],
    tile: videoUrls[generated(slug, `${key}-960.mp4`)],
    poster: posters[generated(slug, `${key}-poster.png`)],
  };
}

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
      const files = d.video ? videoFiles(slug, d.video, d.videoSpeed) : undefined;
      const video = files?.tile && files.page && files.poster ? { tile: files.tile, hero: files.page } : undefined;
      const poster = files?.poster;
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

// Images and videos that follow each other share a group, so they sit 20px
// apart (as in Figma) instead of the 72px between sections.
type Section = CollectionEntry<'explorations'>['data']['sections'][number];
export type SectionGroup = { kind: 'text'; section: Extract<Section, { discriminant: 'text' }> } | { kind: 'media'; items: Section[] };
export function groupSections(sections: Section[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  for (const s of sections) {
    const last = groups.at(-1);
    if (s.discriminant === 'text') groups.push({ kind: 'text', section: s });
    else if (last?.kind === 'media') last.items.push(s);
    else groups.push({ kind: 'media', items: [s] });
  }
  return groups;
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
