"use strict";

function createVivaeObject(request) {
  const url = new URL(request.url);
  const h = new Headers();
  return {
    url,
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
  };
}

module.exports = { createVivaeObject };
