
import { createRequire } from "module";

import { IReader, IWriter } from './interfaces'

import { WebReader } from './classes/readers/web.reader.class';
import { WebWriter } from './classes/writers/web.writer.class';
import type { NodeReader as INodeReader } from './classes/readers/node.reader.class';
import type { NodeWriter as INodeWriter } from './classes/writers/node.writer.class';
const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;

let NodeReader: typeof INodeReader;
let NodeWriter: typeof INodeWriter;

if (isNode) {
    const get = require || createRequire && createRequire(eval(`import.meta.url`));
    const { NodeReader: Reader } = (isNode && get('./classes/readers/node.reader.class.js'));
    const { NodeWriter: Writer } = (isNode && get('./classes/writers/node.writer.class.js'));
    NodeReader = Reader;
    NodeWriter = Writer;
}

export { IReader, IWriter, WebReader, WebWriter, NodeWriter, NodeReader }

