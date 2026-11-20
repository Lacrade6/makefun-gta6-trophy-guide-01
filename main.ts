// Vice City Trophy Guide — hand-in program for make.fun gta6-trophy-guide-01.
// Copies app/ and screenshots/ into the output directory, then builds the
// dossier with the kit's own library so the grader sees exactly the same
// bytes it would build itself. Node 22, standard library only.
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    n += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return n;
}

mkdirSync(outDir, { recursive: true });

for (const part of ['app', 'screenshots']) {
  const src = join(here, part);
  if (!existsSync(src)) {
    console.error('missing ' + part + '/ — nothing to hand in');
    process.exit(1);
  }
  cpSync(src, join(outDir, part), { recursive: true });
  console.log(part + '/: ' + countFiles(src) + ' files copied');
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log('dossier.json written (' + dossier.length + ' bytes)');
console.log('Vice City Trophy Guide handed in to ' + outDir);
