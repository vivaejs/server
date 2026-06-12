/*!
 * vivae
 * (c) 2025-2026
 * Licensed by MIT
 */

"use strict";
const { createVivaeObject } = require("./utils/createVivaeObject.js");
const methods = require("./http/methods.js");
const http = require("http");

function vivae(
  config = {
    allowQueries: true,
  },
) {
  const middlewares = [];

  function server(request) {
    const v = createVivaeObject(request, middlewares, config);
    return v.next();
  }

  server.use = function (arg1, arg2, arg3) {
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

  server.plugin = function (plugin) {
    return server.use(plugin.path, plugin.method, plugin.middleware);
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
