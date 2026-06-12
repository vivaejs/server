# Getting Started

Learn how to make your first Vivae server!

## Creating a project folder

To begin, create a folder called "vivae-app" and enter the directory.

```
mkdir vivae-app
cd vivae-app
```

## Installing

Vivae is a package on npm, you'll need to have [Node.js 18](https://nodejs.org/en/download) or higher for it to function properly. Then install Vivae by using:

```
npm install vivae
```

## Example App

Create a file named `index.js` with this example code to understand it's functionality.

```javascript
import vivae from "@vivaejs/core";

const app = vivae();

app.use((v) => {
  v.send("Hello World!");
});

app.listen(3000);
```

To run it, paste this line to the terminal and your server will start instantly.

```
node index.js
```

Optionally you can add this to your `package.json`.

```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

Then you can now run:

```
npm start
```
