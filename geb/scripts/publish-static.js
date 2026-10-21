import { copyFile, cp, mkdir } from 'node:fs/promises';

// No recursive deletes: only these generated paths are written. In particular,
// MEMORY.md, source files and future chapters remain untouched.
const project = new URL('../', import.meta.url);
await copyFile(new URL('THIRD_PARTY_NOTICES.md', project), new URL('dist/THIRD_PARTY_NOTICES.md', project));
await mkdir(new URL('assets/app/', project), { recursive: true });
await cp(new URL('dist/assets/app/', project), new URL('assets/app/', project), { recursive: true });
await copyFile(new URL('dist/index.html', project), new URL('index.html', project));
console.log('Static GitHub Pages entry updated: geb/index.html + geb/assets/app/');
