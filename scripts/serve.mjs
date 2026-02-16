import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {
    fileURLToPath
} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the repository root (one level above /scripts)
const rootDir = path.resolve(__dirname, "..") + path.sep;

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "0.0.0.0";

const contentTypes = new Map([
    [".html", "text/html; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".ico", "image/x-icon"],
    [".png", "image/png"],
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".gif", "image/gif"],
    [".svg", "image/svg+xml"],
    [".webp", "image/webp"],
]);

function safeResolveUrlPath(urlPathname) {
    // Remove query/hash handled by URL parsing; decode percent-escapes.
    const decoded = decodeURIComponent(urlPathname);
    // Prevent null bytes and normalize.
    const cleaned = decoded.replaceAll("\0", "");

    // Default: serve index.html for root and directory paths.
    const requested = cleaned.endsWith("/") ? `${cleaned}index.html` : cleaned;

    // Ensure path stays within rootDir.
    const absPath = path.resolve(rootDir, `.${requested}`);
    if (!absPath.startsWith(rootDir)) return null;
    return absPath;
}

function send(res, statusCode, headers, body) {
    res.writeHead(statusCode, headers);
    res.end(body);
}

const server = http.createServer((req, res) => {
    try {
        const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

        if (req.method !== "GET" && req.method !== "HEAD") {
            return send(res, 405, {
                "Content-Type": "text/plain; charset=utf-8"
            }, "Method Not Allowed");
        }

        const filePath = safeResolveUrlPath(url.pathname);
        if (!filePath) {
            return send(res, 403, {
                "Content-Type": "text/plain; charset=utf-8"
            }, "Forbidden");
        }

        fs.stat(filePath, (statErr, stat) => {
            if (statErr || !stat.isFile()) {
                return send(res, 404, {
                    "Content-Type": "text/plain; charset=utf-8"
                }, "Not Found");
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = contentTypes.get(ext) ?? "application/octet-stream";

            res.writeHead(200, {
                "Content-Type": contentType,
                "Content-Length": stat.size,
                // Disable caching to make local iteration predictable.
                "Cache-Control": "no-store",
            });

            if (req.method === "HEAD") return res.end();

            const stream = fs.createReadStream(filePath);
            stream.on("error", () => {
                send(res, 500, {
                    "Content-Type": "text/plain; charset=utf-8"
                }, "Internal Server Error");
            });
            stream.pipe(res);
        });
    } catch {
        send(res, 400, {
            "Content-Type": "text/plain; charset=utf-8"
        }, "Bad Request");
    }
});

server.listen(port, host, () => {
    // This prints a URL that works on Windows even if animationnation.localhost is used.
    console.log(`Serving Animation-Nation from ${rootDir}`);
    console.log(`Open: http://animationnation.localhost:${port}/`);
});