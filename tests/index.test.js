const vivae = require("../lib/index.js");
const assert = require("assert");
const http = require("http");

const port = 3000;

const app = vivae();

app.use("/api", "GET", (v) => {
  return v.send([{ currentPath: v.path }]);
});

app.listen(port, () => {
  http
    .get(`http://localhost:${port}/api`, (res) => {
      let body = "";

      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          assert.strictEqual(res.statusCode, 200);
          assert.strictEqual(body, '[{"currentPath":"/api"}]');
          assert.strictEqual(res.headers["content-type"], "application/json");
          console.log("Test passed");
          process.exit(0);
        } catch (err) {
          console.error("Test failed", err.message);
          process.exit(1);
        }
      });
    })
    .on("error", (err) => {
      console.error("Failed to request server", err.message);
      process.exit(1);
    });
});
