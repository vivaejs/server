/*!
 * vivae
 * (c) 2025-2026
 * Licensed by MIT
 */

"use strict";
const methods = require("./http/methods.js");
const { SegmentRouter } = require("./routers/SegmentRouter.js");
const { create_v } = require("./v.js");
const http = require("http");

function vivae() {
  const router = new SegmentRouter();

  function server(request) {
    const v = create_v(request);

    let index = 0;
    async function next(error) {
      const matched = router.match(index, v, next);

      if (matched) {
        return matched;
      }

      if (error) {
        v.status = 500;
        return v.send("Internal Server Error");
      }

      v.status = 404;
      return v.send("Not Found");
    }

    return next();
  }

  server.use = function (route) {
    router.add({
      path: route.path,
      method: route.method,
      middleware: route.middleware,
    });
  };

  server.fetch = server;

  server.listen = function (port, callback) {
    return http
      .createServer(async (req, res) => {
        const request = new Request(`http://${req.headers.host}${req.url}`, {
          method: req.method,
          headers: req.headers,
        });

        const response = await server(request);

        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(await response.text());
      })
      .listen(port, callback);
  };

  return server;
}

module.exports = vivae;
