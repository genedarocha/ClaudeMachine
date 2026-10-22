// Real 9:16 video rendering in the browser: draws branded slides (title → scenes with captions → CTA)
// to a canvas, captures it with MediaRecorder, and (optionally) muxes an OpenAI-TTS voiceover track in.
// Output is a .webm Blob the user downloads or attaches to the calendar. No server, no simulation.

export interface VideoScene {
  caption: string; // big on-screen text
  imageUrl?: string; // optional background image (e.g. Pollinations)
}

export interface VideoSpec {
  title: string;
  subtitle?: string;
  scenes: VideoScene[];
  cta: string; // closing call to action
  brandName: string;
  brandColor: string; // hex
  website: string;
}

export const videoSupported = () =>
  typeof HTMLCanvasElement !== 'undefined' &&
  typeof (HTMLCanvasElement.prototype as unknown as { captureStream?: unknown }).captureStream === 'function' &&
  typeof MediaRecorder !== 'undefined';

const W = 1080;
const H = 1920;

const loadImage = (url: string): Promise<HTMLImageElement | null> =>
  new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Word-wrap text to a max width, returning lines.
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawBackground(ctx: CanvasRenderingContext2D, color: string, img: HTMLImageElement | null) {
  const [r, g, b] = hexToRgb(color);
  ctx.fillStyle = '#0b1020';
  ctx.fillRect(0, 0, W, H);
  if (img) {
    // cover-fit the image, darkened so captions stay readable
    const scale = Math.max(W / img.width, H / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    ctx.fillStyle = 'rgba(8,12,24,0.55)';
    ctx.fillRect(0, 0, W, H);
  } else {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, `rgb(${r * 0.35 | 0},${g * 0.35 | 0},${b * 0.35 | 0})`);
    grad.addColorStop(1, '#0b1020');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }
  // brand accent bar
  ctx.fillStyle = color;
  ctx.fillRect(0, H - 14, W, 14);
}

function drawCaption(ctx: CanvasRenderingContext2D, text: string, _color: string, size = 92) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${size}px -apple-system, "Segoe UI", Roboto, sans-serif`;
  const lines = wrap(ctx, text, W - 180);
  const lineH = size * 1.2;
  let y = H / 2 - (lines.length - 1) * lineH / 2;
  for (const line of lines) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = 24;
    ctx.fillText(line, W / 2, y);
    ctx.restore();
    y += lineH;
  }
}

function drawFooter(ctx: CanvasRenderingContext2D, brand: string, website: string, color: string) {
  ctx.textAlign = 'center';
  ctx.font = '600 40px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(brand.toUpperCase(), W / 2, H - 150);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '500 34px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(website.replace(/^https?:\/\//, ''), W / 2, H - 100);
}

export interface RenderProgress {
  phase: 'images' | 'recording' | 'encoding';
  detail: string;
}

// Decodes the mp3 voiceover and returns an audio MediaStreamTrack plus the clip's duration, so the video
// length can match the narration and the audio is embedded in the file.
async function audioTrack(audio: Blob): Promise<{ track: MediaStreamTrack; duration: number; start: () => void; ctx: AudioContext }> {
  const ctx = new AudioContext();
  const buffer = await ctx.decodeAudioData(await audio.arrayBuffer());
  const dest = ctx.createMediaStreamDestination();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(dest);
  source.connect(ctx.destination);
  return { track: dest.stream.getAudioTracks()[0], duration: buffer.duration, start: () => source.start(), ctx };
}

export async function renderVideo(
  spec: VideoSpec,
  opts: { voiceover?: Blob; secondsPerScene?: number; onProgress?: (p: RenderProgress) => void } = {}
): Promise<Blob> {
  if (!videoSupported()) throw new Error('This browser can\'t record video. Use Chrome or Edge on a desktop.');
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a drawing canvas.');

  // Preload scene images (skip any that fail).
  opts.onProgress?.({ phase: 'images', detail: 'Loading images…' });
  const images = await Promise.all(spec.scenes.map(sc => (sc.imageUrl ? loadImage(sc.imageUrl) : Promise.resolve(null))));

  // Timeline: title (2.4s) + scenes + CTA (3s). If there's narration, stretch scenes to fill it.
  const titleSecs = 2.4;
  const ctaSecs = 3;
  let sceneSecs = opts.secondsPerScene ?? 3.4;
  let voice: Awaited<ReturnType<typeof audioTrack>> | null = null;
  if (opts.voiceover) {
    voice = await audioTrack(opts.voiceover);
    const forScenes = Math.max(spec.scenes.length * 2, voice.duration - titleSecs - ctaSecs);
    sceneSecs = forScenes / Math.max(1, spec.scenes.length);
  }

  const canvasStream = (canvas as HTMLCanvasElement & { captureStream(fps: number): MediaStream }).captureStream(30);
  if (voice) canvasStream.addTrack(voice.track);
  const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
  const recorder = new MediaRecorder(canvasStream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

  const done = new Promise<Blob>(resolve => { recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' })); });
  recorder.start();
  voice?.start();
  opts.onProgress?.({ phase: 'recording', detail: 'Recording…' });

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const frames = async (seconds: number, draw: () => void) => {
    const end = performance.now() + seconds * 1000;
    while (performance.now() < end) {
      draw();
      await sleep(1000 / 30);
    }
  };

  // Title card
  await frames(titleSecs, () => {
    drawBackground(ctx, spec.brandColor, null);
    drawCaption(ctx, spec.title, spec.brandColor, 100);
    if (spec.subtitle) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '500 44px -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(spec.subtitle.slice(0, 60), W / 2, H / 2 + 160);
    }
    drawFooter(ctx, spec.brandName, spec.website, spec.brandColor);
  });

  // Scenes
  for (let i = 0; i < spec.scenes.length; i++) {
    opts.onProgress?.({ phase: 'recording', detail: `Scene ${i + 1} of ${spec.scenes.length}` });
    await frames(sceneSecs, () => {
      drawBackground(ctx, spec.brandColor, images[i]);
      drawCaption(ctx, spec.scenes[i].caption, spec.brandColor);
      drawFooter(ctx, spec.brandName, spec.website, spec.brandColor);
    });
  }

  // CTA
  await frames(ctaSecs, () => {
    drawBackground(ctx, spec.brandColor, null);
    drawCaption(ctx, spec.cta, spec.brandColor, 86);
    drawFooter(ctx, spec.brandName, spec.website, spec.brandColor);
  });

  opts.onProgress?.({ phase: 'encoding', detail: 'Finishing…' });
  recorder.stop();
  const blob = await done;
  voice?.ctx.close().catch(() => {});
  return blob;
}

// Builds the exact narration script per scene for HeyGen / other avatar tools (the handoff path).
export function avatarScript(spec: VideoSpec, voiceover: string): string {
  return [
    `# ${spec.title} — ${spec.brandName}`,
    '',
    voiceover.trim(),
    '',
    '---',
    `End with: ${spec.cta}  (${spec.website})`
  ].join('\n');
}
