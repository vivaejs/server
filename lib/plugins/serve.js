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
          data = fs.readFileSync(filename);
        } else if (config.runtime === "deno") {
          data = await Deno.readFile(filename);
        } else if (config.runtime === "bun") {
          data = Buffer.from(await Bun.file(filename).arrayBuffer());
        }

        if (options?.autoEncoding) {
          if (data[0] === 0x1f && data[1] === 0x8b) {
            v.setHeaders({
              "Content-Encoding": "gzip",
              "Content-Type": "application/octet-stream",
            });
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
