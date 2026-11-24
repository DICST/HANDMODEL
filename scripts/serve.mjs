// Serve a pasta out/ sob o mesmo prefixo do GitHub Pages (padrão: /handmodel), para testar o build.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_PATH ?? '/handmodel';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../out');
const PORT = Number(process.env.PORT || 4400);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.txt': 'text/plain' };

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length) || '/';
    else if (BASE) p = '/__none__';
    let file = path.join(OUT, p);
    if (!file.startsWith(OUT)) file = path.join(OUT, '404.html');
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    const ok = fs.existsSync(file);
    if (!ok) file = path.join(OUT, '404.html');
    res.writeHead(ok ? 200 : 404, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`http://localhost:${PORT}${BASE}/`));
