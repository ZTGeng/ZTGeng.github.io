// Local preview only. Production remains GitHub Pages + Firebase + GitHub API.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const port = Number(process.argv[2] || 8766);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid port");
const header = `<header class="my-3"><nav class="d-flex gap-3 align-items-center flex-wrap">
  <a href="/games/online-gomoku/">Online Gomoku</a><span class="text-secondary">Local preview</span>
  <button class="btn btn-link btn-sm" data-site-language="auto" hidden>Auto</button>
  <button class="btn btn-link btn-sm" data-site-language="en" hidden>English</button>
  <button class="btn btn-link btn-sm" data-site-language="zh" hidden>中文</button>
</nav><hr></header>`;
http.createServer((req, res) => {
  try {
    let url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (url === "/") url = "/games/online-gomoku/";
    if (url.endsWith("/")) url += "index.html";
    if (!["GET", "HEAD"].includes(req.method) ||
        (!url.startsWith("/games/online-gomoku/") && !url.startsWith("/shared/"))) {
      res.writeHead(404); res.end(); return;
    }
    const target = path.resolve(root, `.${url}`);
    const allowed = [path.join(root, "games/online-gomoku"), path.join(root, "shared")];
    const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml" };
    if (!allowed.some(dir => target.startsWith(dir + path.sep)) || !types[path.extname(target)]) {
      res.writeHead(404); res.end(); return;
    }
    fs.readFile(target, (error, data) => {
      if (error) { res.writeHead(404); res.end(); return; }
      if (path.extname(target) === ".html") {
        data = data.toString("utf8").replace(/^---\r?\n[\s\S]*?^---\r?\n/m, "")
          .replace(/{% include header\.html[^%]*%}/g, header)
          .replace(/{% include footer\.html[^%]*%}/g, '<footer class="my-4 text-secondary">Local preview · GitHub Pages renders the shared site header and footer.</footer>');
      }
      res.writeHead(200, { "Content-Type": types[path.extname(target)], "Cache-Control": "no-store" });
      res.end(req.method === "HEAD" ? undefined : data);
    });
  } catch { res.writeHead(400); res.end(); }
}).listen(port, "127.0.0.1", () => {
  console.log(`Local preview: http://localhost:${port}/games/online-gomoku/`);
});
