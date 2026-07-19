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
  const routes = [];

  function server(request) {
    const v = createVivaeObject(request);

    let index = 0;
    async function next(error) {
      while (index < routes.length) {
        const { path, method, middleware } = routes[index++];

        if (!path) {
          try {
            return middleware.length === 2
              ? middleware(error, v)
              : middleware(v);
          } catch (e) {
            return next(e);
          }
        }

        if (!config.allowQueries && v.url.search) {
          v.status = 404;
          return v.send("Not Found");
        }

        // converts to arrays and removes false values
        const segments = path.split("/").filter(Boolean);
        const requested_segments = v.url.pathname.split("/").filter(Boolean);

        // how many segments match the request
        let i = 0;
        // the number of segments allowed by the segment types
        let i2 = 0;
        v.params = {};

        while (i < segments.length) {
          const segment = segments[i];

          if (segment === "*" || segment === "%" || segment === "**") {
            let matched;
            if (i === segments.length - 1) {
              matched = requested_segments.length - i2;
            } else {
              matched =
                requested_segments.length - i2 - (segments.length - i - 1);
            }
            //sdkjjjnhhh//jffnnmnbjbbdssa
            if (segment === "*" && matched < 1) {
              break;
            }

            i2 += matched;
            i++;
            continue;
          }

          if (!requested_segments[i2]) break;

          if (segment.startsWith(":")) {
            // remove the colon before setting the param
            v.params[segment.slice(1)] = requested_segments[i2];
          } else if (segment !== requested_segments[i2]) {
            break;
          }

          i++;
          i2++;
        }

        if (
          i === segments.length &&
          i2 === requested_segments.length &&
          (!method || method.includes(v.method))
        ) {
          try {
            return middleware.length === 2
              ? middleware(error, v)
              : middleware(v);
          } catch (e) {
            return next(e);
          }
        }
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

    routes.push({ path, method, middleware });
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
