# File Agents ![NPM Downloads](https://img.shields.io/npm/dw/file-agents)

The objetive of the repository is to provide classes to read and write with the same interface for Node and Web.

#### NPM installation
```
npm install file-agents
```


## Description

There are four "agents", two for Node and another two for web.

Web includes two subagents to allow support propietary implementation on Chromium

This package is distributed with support for `MJS` and `CommonJS`

## Configuration for web
It requires a framework that allow the use of Top Level Await

### Angular configuration
One solution is use custom builder of webpack
Extracted from: https://www.digitalocean.com/community/tutorials/angular-custom-webpack-config
```
npm install --save-dev @angular-builders/custom-webpack
```

Configure it in `angular.json`
COnfiguration to build
```json
"architect": {
  "build": {
    "builder": "@angular-builders/custom-webpack:browser",
    "options": {
      "customWebpackConfig": {
        "path": "./custom-webpack.config.js",
        "replaceDuplicatePlugins": true
      },
      // ...
    },
    // ...
  },
  // ...
}
```
Configuration to serve
```json
"architect": {
  // ...
  "serve": {
    "builder": "@angular-builders/custom-webpack:dev-server",
     // ...
  },
  // ...
}
```

Create a file called as setted in `angular.json` in this case `custom-webpack.config.js`

And add following:
```js
module.exports = {
  experiments: {
    topLevelAwait: true
  },
  resolve: {
    fallback: {
      "path": false,
      "fs": false,
      "fs/promises": false
    }
  }
}
```


## Examples

### Web

List files:

``` ts
// Import reader for web
import { WebReader } from 'file-agents';
// Instance reader
const webReader = new WebReader();
// List files
const files = await webReader.files();

console.log('Files: ', files);

```

Read from file:
``` ts
// Import reader for web
import { WebReader } from 'file-agents';
// Instance reader
const webReader = new WebReader();
// List files
const files = await webReader.files();
// Select one, normally user select it
const [ file ] = files;
// Read some portion
const blob = await webReader.read({ start: 0, end: 15 }, file.uuid); // uuid is optional except first time
console.log('Blob: ', blob);

```

Read from file and write

``` ts
import { WebReader, WebWriter } from 'file-agents';
// Instance reader
const webReader = new WebReader();
// List files
const files = await webReader.files();
// Select one, normally user select it
const [ file ] = files;
const { uuid, name, size } = file;

const webWriter = new WebWriter({ name, size });
const chunkSize = 1e+7; // 10Mb

// Start reading in a loop
let finished = false;
let cursor = 0;

while(!finished) {
    const chunk = await webReader.read({ start: cursor, end: (cursor + chunkSize) }, uuid);
    await webWriter.write(chunk, cursor);
    cursor += chunk.size;

    finished = cursor >= file.size;
}

webWriter.close();
```

### Node

List files:

``` ts
// Import reader for node
import { NodeReader } from 'file-agents';
// Instance reader
const nodeReader = new NodeReader();
// List files
const files = await nodeReader.files();

console.log('Files: ', files);

```

Read from file:
``` ts
// Import reader for node
import { NodeReader } from 'file-agents';
// Instance reader
const nodeReader = new NodeReader();
// List files
const files = await nodeReader.files();
// Select one, normally user select it
const [ file ] = files;
// Read some portion
const blob = await nodeReader.read({ start: 0, end: 15 }, file.uuid); // uuid is optional except first time
console.log('Blob: ', blob);

```

Read from file and write

``` ts
import { NodeReader, NodeWriter } from 'file-agents';
// Instance reader
const nodeReader = new NodeReader();
// List files
const files = await nodeReader.files();
// Select one, normally user select it
const [ file ] = files;
const { uuid, name, size } = file;

const nodeWriter = new NodeWriter({ name });
const chunkSize = 1e+7; // 10Mb

// Start reading in a loop
let finished = false;
let cursor = 0;

while(!finished) {
    const chunk = await nodeReader.read({ start: cursor, end: (cursor + chunkSize) }, uuid);
    await nodeWriter.write(chunk, cursor);
    cursor += chunk.size;

    finished = cursor >= file.size;
}

nodeWriter.close();
```

Read from file and write using where param on write, allowing to reuse same instance

```ts
import { NodeReader, NodeWriter } from 'file-agents';
// Instance reader
const nodeReader = new NodeReader();
// List files
const files = await nodeReader.files();
// Select one, normally user select it
const [ file ] = files;
const { uuid, name, size } = file;

const nodeWriter = new NodeWriter();
const where = { file: name, path: './Downloads' };
const chunkSize = 1e+7; // 10Mb

// Start reading in a loop
let finished = false;
let cursor = 0;

while(!finished) {
    const chunk = await nodeReader.read({ start: cursor, end: (cursor + chunkSize) }, uuid);
    await nodeWriter.write(chunk, cursor);
    cursor += chunk.size;

    finished = cursor >= file.size;
}
// Using where param to close file
nodeWriter.close(where);
```