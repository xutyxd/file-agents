
import { IReader, IWriter } from './interfaces'

import { WebReader } from './classes/readers/web.reader.class';
import { WebWriter } from './classes/writers/web.writer.class';

const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
const isMJS = typeof require === 'undefined';
// @ts-ignore
const { NodeReader } = isNode && (isMJS ? await import('./classes/readers/node.reader.class.js') : eval(`require('./classes/readers/node.reader.class.js')`));
// @ts-ignore
const { NodeWriter } = isNode && (isMJS ? await import('./classes/writers/node.writer.class.js') : eval(`require('./classes/writers/node.writer.class.js')`));

export { IReader, IWriter, WebReader, WebWriter, NodeWriter, NodeReader }

