"use strict";

function createVivaeObject(request, middlewares, config) {
  let index = 0;
  const url = new URL(request.url);
  const h = new Headers();
  const v = {
    url: request.url,
    path: url.pathname,
    get query() {
      const queries = url.searchParams.toString();

      if (queries) {
        const query = {};
        const pairs = queries.split("&");

        for (const pair of pairs) {
          if (!pair) continue;

          let [key, value] = pair.split("=");

          if (typeof value === "undefined") value = "";

          function parseString(str) {
            if (
              (str.startsWith('"') && str.endsWith('"')) ||
              (str.startsWith("'") && str.endsWith("'"))
            ) {
              // remove quotes, stays a string
              return str.slice(1, -1);
            }
            return str;
          }

          key = parseString(key);
          value = parseString(value);

          if (value === "true") {
            value = true;
          } else if (value === "false") {
            value = false;
            // make sure it can become a number and isn't an empty string
          } else if (!isNaN(value) && value.trim() !== "") {
            value = Number(value);
          }

          query[key] = value;
        }

        return query;
      } else {
        return {};
      }
    },
    params: {},
    method: request.method.toUpperCase(),
    status: 200,
    setHeaders(headers) {
      for (const key in headers) {
        h.set(key, headers[key]);
      }
    },
    respond(status, headers) {
      if (headers) this.setHeaders(headers);
      if (status) this.status = status;
      // chaining support
      return this;
    },
    send(body) {
      if (typeof body === "object" && body !== null && !Buffer.isBuffer(body)) {
        h.set("Content-Type", "application/json");
        body = JSON.stringify(body);
      }

      if (!h.has("Content-Type")) {
        h.set("Content-Type", "text/html");
      }

      return new Response(body, {
        status: this.status,
        headers: h,
      });
    },
    async next(error) {
      while (index < middlewares.length) {
        const { path, method, middleware } = middlewares[index++];

        if (!path) {
          try {
            return middleware.length === 2
              ? middleware(error, this)
              : middleware(this);
          } catch (e) {
            return this.next(e);
          }
        }

        if (!config.allowQueries && url.search) {
          this.status = 404;
          return this.send("Not Found");
        }

        // converts to arrays and removes false values
        const segments = path.split("/").filter(Boolean);
        const requested_segments = url.pathname.split("/").filter(Boolean);

        // how many segments match the request
        let i = 0;
        // the number of segments allowed by the segment types
        let i2 = 0;
        this.params = {};

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
            this.params[segment.slice(1)] = requested_segments[i2];
          } else if (segment !== requested_segments[i2]) {
            break;
          }

          i++;
          i2++;
        }

        if (
          i === segments.length &&
          i2 === requested_segments.length &&
          (!method || method.includes(this.method))
        ) {
          try {
            return middleware.length === 2
              ? middleware(error, this)
              : middleware(this);
          } catch (e) {
            return this.next(e);
          }
        }
      }

      if (error) {
        this.status = 500;
        return this.send("Internal Server Error");
      }

      this.status = 404;
      return this.send("Not Found");
    },
  };

  return v;
}

module.exports = { createVivaeObject };
