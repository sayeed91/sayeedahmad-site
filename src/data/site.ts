import etThumb from '../assets/home/case-elegant-themes.png';
import riseThumb from '../assets/home/case-rise.png';
import moenThumb from '../assets/home/case-moen.png';
import haldenPoster from '../assets/explorations/halden/poster.png';
import haldenVideo from '../assets/explorations/halden/video-960.mp4';
import aurelPoster from '../assets/explorations/aurel/poster.png';
import aurelVideo from '../assets/explorations/aurel/video-960.mp4';
import type { ImageMetadata } from 'astro';

export const site = {
  name: 'Sayeed Ahmad',
  role: 'Product Designer',
  email: 'ahmadsayeed1991@gmail.com',
  linkedin: 'https://www.linkedin.com/in/sayeed-ahmad/',
  dribbble: 'https://dribbble.com/sayeed_ahmad',
  youtube: 'https://www.youtube.com/@sayeedahmaddesigns',
  instagram: 'https://www.instagram.com/sayeedahmaddesigns',
  x: 'https://x.com/sayeedbuilds',
  resume: '/sayeed-ahmad-resume.pdf',
  // No Cal.com link exists yet. Until one does, "Book a call" opens an email.
  bookCall: 'mailto:ahmadsayeed1991@gmail.com?subject=Book%20a%20call',
};

// Story and Ask AI are not designed yet; they stay in the nav as placeholders.
export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/#work' },
  { label: 'Posts', href: '#' },
  { label: 'Story', href: '#' },
  { label: 'Ask AI', href: '#' },
];

export const cases = [
  {
    slug: 'elegant-themes',
    title: 'Elegant Themes: Divi layouts for non-designers',
    period: '2017 – 2026',
    summary:
      'Nine years on Divi, a builder with nearly a million customers, most of them not designers. 200+ layout packs, one Figma source of truth for every Divi module, and the templates Divi AI builds pages from.',
    thumb: etThumb,
    thumbAlt: 'Elegant Themes logo on a purple to blue gradient',
  },
  {
    slug: 'rise',
    title: 'Rise: paying global teams',
    period: '5 months · 2023',
    summary:
      'Product design for a payroll and compliance platform that pays contractors in 190+ countries. About 70 screens across six product areas, in light and dark, with tokens named 1:1 with Tailwind.',
    thumb: riseThumb,
    thumbAlt: 'Rise logo on a purple gradient',
  },
  {
    slug: 'moen',
    title: 'Moen: three smart-water apps into one',
    period: '8 months · 2023',
    summary:
      'One of four designers on the merge. I owned the source-of-truth Figma file and kept every screen attached to the 400+ component system, ready for handoff.',
    thumb: moenThumb,
    thumbAlt: 'Moen Smart Water Network logo on a slate blue gradient',
  },
] as const;

export type CaseSlug = (typeof cases)[number]['slug'];

export const nextCase = (slug: CaseSlug) => {
  const i = cases.findIndex((c) => c.slug === slug);
  return cases[(i + 1) % cases.length];
};

// Explorations on the home page. Entries without a thumbnail render as an
// empty 4:3 slot. To fill one: export the shot at 1600×1200, put it in
// src/assets/explorations/, import it above and set `thumb`. The tile crops
// to 4:3 itself, so the image drops into place.
// `video` is a 960×720 muted loop for the tile; `thumb` is then its first
// frame and doubles as the poster. `slug` means a detail page exists at
// /explorations/<slug>.
// The home grid shows the first six (two rows of three); the rest stay in the
// list for prev/next and "More explorations".
type Exploration = {
  title: string;
  type: string;
  isNew?: boolean;
  thumb?: ImageMetadata;
  video?: string;
  slug?: string;
};
export const explorations: Exploration[] = [
  { title: 'Halden', type: 'Landing page', isNew: true, thumb: haldenPoster, video: haldenVideo, slug: 'halden' },
  { title: 'Aurel', type: 'Landing page', thumb: aurelPoster, video: aurelVideo, slug: 'aurel' },
  { title: 'Lintel', type: 'Mobile app', isNew: true },
  { title: 'Saffra checkout', type: 'Mobile app' },
  { title: 'NOMA sales dashboard', type: 'Web app' },
  { title: 'AERA flight booking', type: 'Mobile app' },
  { title: 'Romp pet care', type: 'Landing page' },
];

export const experience = [
  {
    company: 'Elegant Themes',
    context: 'Divi and Divi AI',
    period: '2017 – 2026',
    role: 'Product Designer · Remote',
    body: 'I designed 200+ layout packs and campaign templates, rebuilt every Divi module as a Figma component so sections and layouts come from one source, and wrote the Divi Build Guidelines. Those templates are what Divi AI builds pages from.',
    open: true,
  },
  {
    company: 'UX Cabin',
    context: 'Rise and Moen, on contract',
    period: '2022 – 2024',
    role: 'UI/UX Designer · Contract, Remote',
    body: 'On Rise I designed the product UI end to end and its light and dark design system, with token names that match Tailwind. On Moen I was on the design system team for the app that merged three smart-water apps into one, and owned the source-of-truth file developers built from.',
  },
  {
    company: 'Benchmark Agency',
    context: 'Client websites and health apps',
    period: '2016 – 2017',
    role: 'UI/UX Designer · Remote',
    // From the resume line in linkedin.md (marked there as not yet reviewed).
    body: 'Designed and launched 15+ responsive client websites across healthcare, finance and lifestyle, with a focus on accessibility and usability.',
  },
];

export const recommendations = [
  {
    quote:
      '“His primary responsibilities were to redesign the product, but he took the initiative to learn how to use Webflow. This enabled him to help the client with their marketing website and brought in additional business to UX Cabin.”',
    name: 'Adam Sadowski',
    initials: 'AS',
    title: 'Lead Product Designer at Conduit · managed Sayeed at UX Cabin',
  },
  {
    quote:
      '“His role in preparing and designing design system presentations for UX Cabin’s client projects has been exceptional. His clean and precise approach has resulted in visually stunning and organized deliverables.”',
    name: 'Joe Montero',
    initials: 'JM',
    title: 'Product Designer · same team at UX Cabin',
  },
];

// Neighbours for an exploration's detail page: previous and next wrap around
// the list, and "More explorations" shows the two after it.
export const explorationNeighbours = (slug: string) => {
  const i = explorations.findIndex((x) => x.slug === slug);
  const at = (n: number) => explorations[(i + n + explorations.length) % explorations.length];
  return { prev: at(-1), next: at(1), more: [at(1), at(2)] };
};
