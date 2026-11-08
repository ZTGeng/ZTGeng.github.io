import { copyFile, cp, mkdir, readdir } from 'node:fs/promises';

// No recursive deletes: only these generated paths are written. In particular,
// MEMORY.md, source files and future chapters remain untouched.
const project = new URL('../', import.meta.url);
await copyFile(new URL('THIRD_PARTY_NOTICES.md', project), new URL('dist/THIRD_PARTY_NOTICES.md', project));
await mkdir(new URL('assets/app/', project), { recursive: true });
await cp(new URL('dist/assets/app/', project), new URL('assets/app/', project), { recursive: true });
for (const page of ['index.html', '404.html']) {
  await copyFile(new URL(`dist/${page}`, project), new URL(page, project));
}
for (const chapter of await readdir(new URL('dist/chapters/', project), { withFileTypes: true })) {
  if (!chapter.isDirectory()) continue;
  await mkdir(new URL(`chapters/${chapter.name}/`, project), { recursive: true });
  await cp(new URL(`dist/chapters/${chapter.name}/`, project), new URL(`chapters/${chapter.name}/`, project), { recursive: true });
}
console.log('Static GitHub Pages pages updated: geb/index.html + geb/404.html + geb/chapters/ + geb/assets/app/');
