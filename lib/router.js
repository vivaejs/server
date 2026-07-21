"use strict";

class Router {
  constructor() {
    this.routes = [];
  }

  add(route) {
    this.routes.push(route);
  }

  match(index, v, next) {
    while (index < this.routes.length) {
      const { path, method, middleware } = this.routes[index++];

      if (!path) {
        try {
          return middleware(v, next);
        } catch (e) {
          return next(e);
        }
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
          return middleware(v, next);
        } catch (e) {
          return next(e);
        }
      }
    }
  }
}

module.exports = { Router };
