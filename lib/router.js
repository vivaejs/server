"use strict";

class Router {
  constructor() {
    this.routes = [];
  }

  add(route) {
    this.routes.push(route);
  }
}

module.exports = { Router };
