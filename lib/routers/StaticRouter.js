"use strict";

class StaticRouter {
  constructor() {
    this.routes = [];
  }

  add(route) {
    this.routes.push(route);
  }

  match(index, v, next) {
    while (index < this.routes.length) {
      const { path, method, middleware } = this.routes[index++];

      if (path === v.path && (!method || method.includes(v.method))) {
        try {
          return middleware(v, next);
        } catch (e) {
          return next(e);
        }
      }
    }
  }
}

module.exports = { StaticRouter };
