"use strict";
const serve = require("./serve.js")

function createPlugin(fn) {
  return (...args) => ({
    plugin: true,
    init(server) {
      return fn(...args)(server);
    },
  });
}

module.exports = { createPlugin, serve };
