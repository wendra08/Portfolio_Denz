import sharp from 'sharp';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Regenerate optimized assets without changing the source photographs.
for (const name of ['hero-kang-denz', 'wedding-mc-kang-denz']) {
  await sharp(`public/images/${name}.png`).webp({ quality: 82 }).toFile(`public/images/${name}.webp`);
  await sharp(`public/images/${name}.png`).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`public/images/${name}-800.webp`);
}

const favicon = await readFile('public/favicon.svg');
await sharp(favicon).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(favicon).resize(180, 180).png().toFile('public/apple-touch-icon.png');
// A PNG-backed ICO also covers browsers that request /favicon.ico automatically.
const icon = await sharp(favicon).resize(64, 64).png().toBuffer();
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);
icoHeader[6] = 64; icoHeader[7] = 64;
icoHeader.writeUInt16LE(1, 10); icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(icon.length, 14); icoHeader.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([icoHeader, icon]));
await sharp('public/images/og-kang-denz.svg').jpeg({ quality: 90 }).toFile('public/images/og-kang-denz.jpg');

const metadata = {};
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) { await scan(filename); continue; }
    if (!/\.(?:png|jpe?g|webp)$/.test(filename)) continue;
    const { width, height } = await sharp(filename).metadata();
    metadata['/' + path.relative('public', filename).split(path.sep).join('/')] = { width, height };
  }
}
await scan('public/images');
await mkdir('src/data', { recursive: true });
await writeFile('src/data/image-sizes.json', JSON.stringify(metadata, null, 2) + '\n');
console.log('Optimized images, brand icons, social card, and image dimensions generated.');
