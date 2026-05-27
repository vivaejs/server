"use strict";
const path = require("path");
const fs = require("fs");

function createPlugin(fn) {
  return (...args) => ({
    plugin: true,
    init(server) {
      return fn(...args)(server);
    },
  });
}

const serve = createPlugin(
  (
    options = {
      directory: "public",
      autoEncoding: false,
      headers: {
        ".html": { "Content-Type": "text/html" },
        ".css": { "Content-Type": "text/css" },
        ".txt": { "Content-Type": "text/plain" },
        ".js": { "Content-Type": "application/javascript" },
        ".json": { "Content-Type": "application/json" },
        ".png": { "Content-Type": "image/png" },
        ".jpg": { "Content-Type": "image/jpeg" },
        ".jpeg": { "Content-Type": "image/jpeg" },
        ".gif": { "Content-Type": "image/gif" },
        ".svg": { "Content-Type": "image/svg+xml" },
        ".webp": { "Content-Type": "image/webp" },
        ".ico": { "Content-Type": "image/x-icon" },
        ".woff": { "Content-Type": "font/woff" },
        ".woff2": { "Content-Type": "font/woff2" },
        ".ttf": { "Content-Type": "font/ttf" },
        ".otf": { "Content-Type": "font/otf" },
        ".mp4": { "Content-Type": "video/mp4" },
        ".webm": { "Content-Type": "video/webm" },
        ".pdf": { "Content-Type": "application/pdf" },
        ".zip": { "Content-Type": "application/zip" },
        ".gz": {
          "Content-Encoding": "gzip",
          "Content-Type": "application/octet-stream",
        },
        ".br": {
          "Content-Encoding": "br",
          "Content-Type": "application/octet-stream",
        },
      },
    },
  ) => {
    return () => ({
      middleware: function (vobj) {
        try {
          const filename = path.join(path.resolve(options.directory), vobj.path);
          const ext = path.extname(filename).toLowerCase();

          const fd = fs.openSync(filename, "r");
          const buffer = Buffer.alloc(4);
          fs.readSync(fd, buffer, 0, 4, 0);
          
          const data = fs.readFileSync(filename, "utf-8");
          fs.closeSync(fd);

          if (ext && options?.headers[ext]) {
            vobj.setHeaders(options.headers[ext]);
          }

          if (options?.autoEncoding) {
            if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
              vobj.setHeaders({
                "Content-Encoding": "gzip",
                "Content-Type": "application/octet-stream",
              });
            }
          }

          vobj.send(data);
        } catch (err) {
          vobj.next();
        }
      },
    });
  },
);

module.exports = {
  createPlugin,
  serve,
};
