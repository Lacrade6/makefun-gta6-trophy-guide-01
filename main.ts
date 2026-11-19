// Vice City Trophy Guide — hand-in entrypoint (Node 22, standard library only).
//
// Copies app/ and screenshots/ from beside this file into the output directory
// (/output in the grader, or $MAKEFUN_OUTPUT_DIR locally) and writes
// dossier.json with the vendored make.fun library — byte for byte what the
// scorer writes from the same files. Run it with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The caps below are the scorer's own (kit reference/gate.json): at most 4
// screenshots, each at most 256 KiB; app/ at most 993 entries and 48 MiB;
// the dossier text at most 160 KiB. Only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyDir(name: string): void {
  const src = join(here, name);
  const dst = join(out, name);
  if (!existsSync(src)) throw new Error(`missing ${name}/ beside main.ts — nothing to hand in`);
  cpSync(src, dst, { recursive: true });
  const entries = readdirSync(dst, { recursive: true });
  console.error(`copied ${name}/: ${entries.length} entries`);
}

mkdirSync(out, { recursive: true });
copyDir('app');
copyDir('screenshots');

const dossier = buildDossier(out, CAPS);
writeFileSync(join(out, 'dossier.json'), dossier);
console.error(`wrote dossier.json: ${dossier.length} bytes`);
