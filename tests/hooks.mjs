// Lets Node run the app's TypeScript in tests: "@/" paths, imports without ".ts", and photo files (stubbed).
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = fileURLToPath(new URL('../src/', import.meta.url));
export async function resolve(spec, ctx, next) {
  if (spec.startsWith('@/')) spec = pathToFileURL(ROOT + spec.slice(2)).href;
  if ((spec.startsWith('.') || spec.startsWith('file:')) && !/\.(ts|tsx|js|mjs|json)$/.test(spec)) {
    const base = new URL(spec, ctx.parentURL);
    for (const ext of ['.ts', '.tsx', '/index.ts']) if (existsSync(fileURLToPath(base.href + ext))) return next(base.href + ext, ctx);
  }
  return next(spec, ctx);
}
export async function load(url, ctx, next) {
  const r = await next(url, ctx);
  if (url.endsWith('/photos.ts')) r.source = String(r.source).replace(/require\([^)]*\)/g, '1');
  return r;
}
