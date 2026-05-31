import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL("../preview/", import.meta.url).pathname;
const port = Number(process.env.PORT || 4173);
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

createServer(async (request, response) => {
  const requested = request.url === "/" ? "index.html" : request.url.slice(1);
  const path = normalize(join(root, requested));
  if (!path.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    response.writeHead(200, { "Content-Type": mime[extname(path)] || "text/plain; charset=utf-8" });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Standalone MVP preview: http://localhost:${port}`));
