# File Agents

The objetive of the repository is to provide classes to read and write with the same interface for Node and Web.

## Description

There are four "agents", two for Node and another two for web.

Web includes two subagents to allow support propietary implementation on Chromium

This package is distributed with support for `MJS` and `CommonJS`


## Examples

### Web

List files:

``` ts
// Import reader for web
import { WebReader } from 'file-agents/web';
// Instance reader
const webReader = new WebReader();
// List files
const files = await webReader.files();

console.log('Files: ', files);

```

Read from file:
``` ts
// Import reader for web
import { WebReader } from 'file-agents/web';
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
import { WebReader, WebWriter } from 'file-agents/web';
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
import { NodeReader } from 'file-agents/node';
// Instance reader
const nodeReader = new NodeReader();
// List files
const files = await nodeReader.files();

console.log('Files: ', files);

```

Read from file:
``` ts
// Import reader for node
import { NodeReader } from 'file-agents/node';
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
import { NodeReader, NodeWriter } from 'file-agents/node';
// Instance reader
const nodeReader = new NodeReader();
// List files
const files = await nodeReader.files();
// Select one, normally user select it
const [ file ] = files;
const { uuid, name, size } = file;

const nodeWriter = new NodeWriter({ name, size });
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