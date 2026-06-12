"use strict";
const mime_types = require("../http/mime_types");
const path = require("path");
const fs = require("fs");

const serve = function (
  options = {
    directory: "public",
    autoEncoding: false,
    runtime: "node",
    headers: mime_types,
  },
) {
  return {
    middleware: function (v) {
      try {
        const filename = path.join(path.resolve(options.directory), v.path);
        const ext = path.extname(filename).toLowerCase();

        let data;

        if (options.runtime === "node" || options.runtime === "serverless") {
          const fd = fs.openSync(filename, "r");
          const buffer = Buffer.alloc(4);
          fs.readSync(fd, buffer, 0, 4, 0);

          data = fs.readFileSync(filename, "utf-8");
          fs.closeSync(fd);

          if (options?.autoEncoding) {
            if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
              v.setHeaders({
                "Content-Encoding": "gzip",
                "Content-Type": "application/octet-stream",
              });
            }
          }
        }

        if (ext && options?.headers[ext]) {
          v.setHeaders(options.headers[ext]);
        }

        return v.send(data);
      } catch (err) {
        return v.next();
      }
    },
  };
};

module.exports = serve;
