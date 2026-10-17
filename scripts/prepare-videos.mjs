// Compresses each exploration's uploaded video before the build:
//   video-1280.mp4  the page hero (640px column at 2x)
//   video-960.mp4   the home tile
//   poster.png      first frame, used as poster and thumbnail
// Output goes to src/generated/explorations/<slug>/ (not committed). A hash of
// the source file and speed skips work that's already done, so CI only encodes
// what changed.
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
  if (!data.video) continue;
  const src = resolve(contentDir, data.video);
  if (!existsSync(src)) {
    console.warn(`[videos] ${slug}: ${data.video} not found, skipped`);
    continue;
  }
  const speed = Number(data.videoSpeed) || 1;
  const out = join(outRoot, slug);
  const stamp = join(out, '.hash');
  const hash = await hashFile(src, `v2:${speed}`);
  if (existsSync(stamp) && readFileSync(stamp, 'utf8') === hash) continue;

  console.log(`[videos] ${slug}: encoding at ${speed}x…`);
  mkdirSync(out, { recursive: true });
  encode(src, speed, '1280:960', 24, join(out, 'video-1280.mp4'));
  encode(src, speed, '960:720', 26, join(out, 'video-960.mp4'));
  execFileSync(ffmpeg, [
    '-v', 'error', '-y', '-i', src, '-frames:v', '1',
    '-vf', 'scale=1920:1440:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1440', join(out, 'poster.png'),
  ]);
  writeFileSync(stamp, hash);
}
