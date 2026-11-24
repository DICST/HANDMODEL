// Pós-build do export estático para o GitHub Pages.
//
// O Next 16 grava os dados de navegação (RSC) em pastas aninhadas,
//   out/modelo-hand/__next.!KHB0KQ/$oc$slug/__PAGE__.txt
// mas o navegador os pede com nomes planos,
//   /modelo-hand/__next.!KHB0KQ.$oc$slug.__PAGE__.txt
// Um servidor estático puro (GitHub Pages) não faz essa tradução, então criamos as cópias planas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../out');
let n = 0;

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (e.name.startsWith('__next.')) flatten(p, dir, e.name);
    else if (e.name !== '_next') walk(p);
  }
}

function flatten(segDir, parent, prefix) {
  for (const e of fs.readdirSync(segDir, { withFileTypes: true })) {
    const p = path.join(segDir, e.name);
    const name = `${prefix}.${e.name}`;
    if (e.isDirectory()) flatten(p, parent, name);
    else {
      fs.copyFileSync(p, path.join(parent, name));
      n++;
    }
  }
}

walk(OUT);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(`postbuild: ${n} arquivos RSC com nome plano; .nojekyll criado`);
