/*!
 * vivae
 * (c) 2025-2026
 * Licensed by MIT
 */

"use strict";
const { defaults } = require("./utils/config.js");
const { createVobj } = require("./utils/vobj.js");
const methods = require("./http/methods.js");
const http = require("http");

function vivae(config = defaults) {
  const middlewares = [];

  function server(request) {
    const v = createVobj(request, middlewares, config);
    return v.next();
  }

  server.use = function (arg1, arg2, arg3) {
    if (arg1?.plugin && typeof arg1?.init === "function") {
      const plugin = arg1.init(server);
      return server.use(plugin.path, plugin.method, plugin.middleware);
    }

    let path;
    let method;
    let middleware;

    [arg1, arg2, arg3].forEach((arg) => {
      if (arg !== undefined) {
        if (typeof arg === "string") {
          if (methods.includes(arg)) {
            method = [arg];
          } else {
            path = arg;
          }
        } else if (Array.isArray(arg)) {
          method = arg;
        } else if (typeof arg === "function") {
          middleware = arg;
        }
      }
    });

    middlewares.push({ path, method, middleware });
  };

  server.fetch = { fetch: server };

  server.listen = function (port, callback) {
    if (config.debug?.logging) {
      server.use((v) => {
        console.log(v.method, v.path);
        v.next();
      });
    }
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
