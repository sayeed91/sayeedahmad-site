// Compresses every video an exploration uses before the build, so he can
// upload the raw export from Figma Motion. For each video it writes, into
// src/generated/explorations/<slug>/ (not committed):
//   <key>-1280.mp4   page size (640px column at 2x)
//   <key>-960.mp4    home tile size (cover video only)
//   <key>-poster.png first frame at 1920×1440, shown before playback and as the thumbnail
// <key> is the video's path inside src/assets/explorations/<slug>/ (see videoKey
// in src/data/explorations.ts). A hash of the source and speed skips videos that
// are already done, so CI only encodes what changed.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, createReadStream } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src/content/explorations');
const outRoot = join(root, 'src/generated/explorations');

// System ffmpeg when there is one, else the binary from ffmpeg-static.
let ffmpeg = 'ffmpeg';
try {
  execFileSync(ffmpeg, ['-version'], { stdio: 'ignore' });
} catch {
  ffmpeg = (await import('ffmpeg-static')).default;
}

// Must match videoKey() in src/data/explorations.ts.
const videoKey = (path, slug, speed = 1) =>
  path
    .replace(new RegExp(`^.*?explorations/${slug}/`), '')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-') + (speed !== 1 ? `-x${String(speed).replace('.', '_')}` : '');

const hashFile = (path, extra) =>
  new Promise((ok, fail) => {
    const h = createHash('sha256').update(extra);
    createReadStream(path).on('data', (d) => h.update(d)).on('end', () => ok(h.digest('hex'))).on('error', fail);
  });

const encode = (src, speed, size, crf, out) => {
  const speedFilter = speed && speed !== 1 ? `setpts=PTS/${speed},` : '';
  execFileSync(ffmpeg, [
    '-v', 'error', '-y', '-i', src, '-an',
    '-vf', `${speedFilter}scale=${size}:force_original_aspect_ratio=increase:flags=lanczos,crop=${size},format=yuv420p`,
    '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-tag:v', 'avc1',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', out,
  ]);
};

if (!existsSync(contentDir)) process.exit(0);

for (const file of readdirSync(contentDir).filter((f) => f.endsWith('.yaml'))) {
  const slug = file.replace(/\.yaml$/, '');
  const data = parse(readFileSync(join(contentDir, file), 'utf8')) ?? {};
  const videos = [];
  if (data.video) videos.push({ path: data.video, speed: data.videoSpeed, cover: true });
  for (const block of data.sections ?? []) {
    if (block?.discriminant === 'video' && block.value?.video) {
      videos.push({ path: block.value.video, speed: block.value.speed, cover: false });
    }
  }

  for (const { path, speed: rawSpeed, cover } of videos) {
    const src = resolve(contentDir, path);
    if (!existsSync(src)) {
      console.warn(`[videos] ${slug}: ${path} not found, skipped`);
      continue;
    }
    const speed = Number(rawSpeed) || 1;
    const key = videoKey(path, slug, speed);
    const out = join(outRoot, slug);
    const stamp = join(out, `${key}.hash`);
    const hash = await hashFile(src, `v3:${speed}:${cover}`);
    if (existsSync(stamp) && readFileSync(stamp, 'utf8') === hash) continue;

    console.log(`[videos] ${slug}/${key}: encoding at ${speed}x…`);
    mkdirSync(out, { recursive: true });
    encode(src, speed, '1280:960', 24, join(out, `${key}-1280.mp4`));
    if (cover) encode(src, speed, '960:720', 26, join(out, `${key}-960.mp4`));
    execFileSync(ffmpeg, [
      '-v', 'error', '-y', '-i', src, '-frames:v', '1',
      '-vf', 'scale=1920:1440:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1440',
      join(out, `${key}-poster.png`),
    ]);
    writeFileSync(stamp, hash);
  }
}
