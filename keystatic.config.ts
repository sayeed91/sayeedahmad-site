import { config, collection, fields } from '@keystatic/core';

// The admin panel at /keystatic. Locally it edits files on disk; on the live
// site it commits to GitHub, which triggers a deploy.
const files = {
  directory: 'src/assets/explorations',
  // Relative to src/content/explorations/<slug>.yaml, so Astro can optimise images.
  publicPath: '../../assets/explorations/',
};

export default config({
  storage: import.meta.env.DEV
    ? { kind: 'local' }
    : { kind: 'github', repo: { owner: 'sayeed91', name: 'sayeedahmad-site' } },
  ui: {
    brand: { name: 'sayeedahmad.com' },
  },
  collections: {
    explorations: collection({
      label: 'Explorations',
      slugField: 'name',
      path: 'src/content/explorations/*',
      format: { data: 'yaml' },
      columns: ['name', 'order'],
      schema: {
        name: fields.slug({
          name: { label: 'Name', description: 'Short name on the home tile, e.g. "Halden".' },
          slug: { label: 'URL', description: 'The page lives at /explorations/<this>.' },
        }),
        order: fields.integer({
          label: 'Order',
          description: 'Position in the grid, 1 = first. The home page shows the first six.',
          defaultValue: 1,
          validation: { isRequired: true },
        }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Landing page', value: 'Landing page' },
            { label: 'Mobile app', value: 'Mobile app' },
            { label: 'Web app', value: 'Web app' },
          ],
          defaultValue: 'Landing page',
        }),
        isNew: fields.checkbox({ label: 'Show the "New" badge' }),
        video: fields.file({
          label: 'Cover video',
          description:
            'Shown on the home tile and at the top of the page. MP4, 4:3 (e.g. 1600 × 1200 from Figma Motion), under 25 MB. It is compressed automatically for the page and the home tile, and its first frame becomes the thumbnail.',
          ...files,
        }),
        videoSpeed: fields.number({
          label: 'Cover video speed',
          description: '1 = as exported. 1.2 = 20% faster, 0.8 = 20% slower.',
          defaultValue: 1,
          step: 0.05,
          validation: { min: 0.5, max: 3 },
        }),
        thumbnail: fields.image({
          label: 'Cover image (only without a cover video)',
          description: '1600 × 1200 PNG or JPG. Ignored when a video is set.',
          ...files,
        }),
        pageTitle: fields.text({
          label: 'Page title',
          description: 'Leave empty for "no page yet". With a title and sections, the tile becomes a link.',
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        lede: fields.text({ label: 'Intro text', multiline: true }),
        videoAlt: fields.text({
          label: 'Cover description',
          description: 'For screen readers, e.g. "A scroll through the Halden landing page on desktop and mobile."',
        }),
        sections: fields.blocks(
          {
            text: {
              label: 'Text',
              itemLabel: (props) =>
                props.fields.heading.value || props.fields.body.value.slice(0, 60) || 'Text',
              schema: fields.object({
                heading: fields.text({ label: 'Heading (optional)', description: 'e.g. Challenge, Solution' }),
                body: fields.text({
                  label: 'Text',
                  multiline: true,
                  description: 'An empty line starts a new paragraph. Lines starting with "- " become a bullet list.',
                }),
              }),
            },
            image: {
              label: 'Image',
              itemLabel: (props) => props.fields.alt.value || 'Image',
              schema: fields.object({
                image: fields.image({
                  label: 'Image',
                  description: 'Export the 640-wide Figma frame at 3x (1920 wide), PNG. Any height works.',
                  validation: { isRequired: true },
                  ...files,
                }),
                alt: fields.text({ label: 'Description', description: 'What the image shows, for screen readers.' }),
              }),
            },
            video: {
              label: 'Video',
              itemLabel: (props) => props.fields.alt.value || 'Video',
              schema: fields.object({
                video: fields.file({
                  label: 'Video',
                  description: 'MP4, 4:3, under 25 MB. Plays muted on a loop while on screen.',
                  validation: { isRequired: true },
                  ...files,
                }),
                speed: fields.number({
                  label: 'Speed',
                  description: '1 = as exported, 1.2 = 20% faster.',
                  defaultValue: 1,
                  step: 0.05,
                  validation: { min: 0.5, max: 3 },
                }),
                alt: fields.text({ label: 'Description', description: 'What the video shows, for screen readers.' }),
              }),
            },
          },
          {
            label: 'Content blocks',
            description:
              'Like a Dribbble shot: add Text, Image and Video blocks in any order, and drag to reorder. Images and videos placed one after another sit close together.',
          },
        ),
      },
    }),
  },
});
