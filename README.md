# Vivae

Vivae is a lightweight, dependency-free framework built to help you quickly create and manage HTTP servers using a custom routing engine, middleware, and plugin system designed for minimal code, control, and your server's architecture.

View the [docs](https://github.com/vivaejs/vivae/blob/main/docs/index.md).

## Why is it unique?

- Plugin Creation
- Built in Static Serving
- TypeScript, CommonJS and ESM support
- Built in wildcard routing system
- Minimal, dependency-free runtime

And guess what? It's packaged smaller than 20kb!

## Installation

```
npm install @vivaejs/server
```

## Usage Example

```javascript
import vivae from "@vivaejs/server";

const app = vivae();
const port = 3000;

app.use("/", ["GET", "POST"], (v) => {
  return v.send("Hello World!");
});

// Node.js
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
// Edge
export default {
  fetch: app.fetch,
};
```

## License

[MIT](https://github.com/sudo-njr/vivae/blob/main/LICENSE)
