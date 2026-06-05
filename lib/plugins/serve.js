"use strict";
const mime_types = require("../http/mime_types");
const { createPlugin } = require("./index.js");
const path = require("path");
const fs = require("fs");

const serve = createPlugin(
  (
    options = {
      directory: "public",
      autoEncoding: false,
      headers: mime_types,
    },
  ) => {
    return () => ({
      middleware: function (v) {
        try {
          const filename = path.join(path.resolve(options.directory), v.path);
          const ext = path.extname(filename).toLowerCase();

          const fd = fs.openSync(filename, "r");
          const buffer = Buffer.alloc(4);
          fs.readSync(fd, buffer, 0, 4, 0);

          const data = fs.readFileSync(filename, "utf-8");
          fs.closeSync(fd);

          if (ext && options?.headers[ext]) {
            v.setHeaders(options.headers[ext]);
          }

          if (options?.autoEncoding) {
            if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
              v.setHeaders({
                "Content-Encoding": "gzip",
                "Content-Type": "application/octet-stream",
              });
            }
          }

          return v.send(data);
        } catch (err) {
          return v.next();
        }
      },
    });
  },
);

module.exports = serve;
