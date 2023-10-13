import { readdirSync, statSync, openAsBlob, existsSync } from 'fs';
import { join } from 'path';

import { IReader } from "../../interfaces/reader.interface";

type Readable = Blob & { lastModified: number, uuid: string, name: string };

export class NodeReader implements IReader {

    private readables?: Promise<Readable[]> | Readable[];
    private selected?: string;

    constructor(private path = '.') { }

    private async list() {
        const where = this.path;
        const exist = existsSync(where);

        if (!exist) {
            throw new Error('Selected folder doesnt exists.');
        }

        const folder = statSync(where);

        if (!folder.isDirectory()) {
            throw new Error('Selected folder is not a folder.');
        }

        const files = readdirSync(where, { encoding: 'binary' });
        const stats = files.map((file) => ({ path: join(where, file), stat: statSync(join(where, file)), name: file }));
        const fileStats = stats.filter(({ stat }) => stat.isFile());

        this.readables = await Promise.all(fileStats.map(async ({ path, stat, name }) => {
            const blob = await openAsBlob(path);

            Object.defineProperties(blob, {
                lastModified: {
                  value: Math.round(stat.mtimeMs),
                  writable: false,
                },
                name: {
                    value: name,
                    writable: false
                },
                uuid: {
                    value: crypto.randomUUID(),
                    writable: false
                }
              });

            return blob as Readable;
        }));

        return this.readables;
    }

    private get = async () => {
        let readables = this.readables;

        if (!readables) {
            readables = this.list();
        }

        if (readables instanceof Promise) {
            readables = await readables;
        }

        return readables;
    }

    public async files() {

        const readables = await this.get();

        return readables.map((file) => {
            const { name, lastModified, size, type, uuid } = file;
            return { name, lastModified, size, type, uuid };
        });
    }

    public async read(options: { start: number, end: number}, selected = this.selected): Promise<Blob> {
        if (!selected) {
            throw new Error(`File not selected.`);
        }

        const readables = await this.get();

        const file = readables.find(({ uuid }) => uuid === selected);

        if (!file) {
            throw new Error('File selected not found on list.');
        }

        const { start, end } = options;
        
        return file.slice(start, end);
    }
}