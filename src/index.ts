
import { IReader, IWriter } from './interfaces'

import { WebReader } from './classes/readers/web.reader.class';
import { WebWriter } from './classes/writers/web.writer.class';
import type { NodeReader as INodeReader } from './classes/readers/node.reader.class';
import type { NodeWriter as INodeWriter } from './classes/writers/node.writer.class';
const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
const isMJS = typeof require === 'undefined';
// @ts-ignore
const { NodeReader: Reader } = (isNode && (isMJS ? await import('./classes/readers/node.reader.class.js') : eval(`require('./classes/readers/node.reader.class.js')`))) as INodeReader;
// @ts-ignore
const { NodeWriter: Writer } = (isNode && (isMJS ? await import('./classes/writers/node.writer.class.js') : eval(`require('./classes/writers/node.writer.class.js')`))) as INodeWriter;
const NodeReader: typeof INodeReader = Reader;
const NodeWriter: typeof INodeWriter = Writer;

export { IReader, IWriter, WebReader, WebWriter, NodeWriter, NodeReader }

