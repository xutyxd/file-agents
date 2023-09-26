import { readdirSync, statSync, openAsBlob, existsSync } from 'fs';
import { join } from 'path';

import { IReader } from "../../interfaces/reader.interface";

export class NodeReader implements IReader {

    private readables: (Blob & { lastModified: number })[] = [];

    public on!: {
        ready: Promise<void>
    }

    constructor(path = '.') {
        this.on = {
            ready: this.init(path)
        }
    }

    private async init(where: string) {
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
              });

            return blob as Blob & { lastModified: number };
        }));
    }

    public files() {
        return this.readables.map((file) => {
            const { name, lastModified, size, type } = file;
            return { name, lastModified, size, type };
        });
    }

    public read(options: { start: number, end: number}, index = 0): Blob {
        const file = this.readables[index];

        if (!file) {
            throw new Error(`File index selected out of range. Valid range: 0 - ${this.readables.length - 1}`);
        }

        const { start, end } = options;
        
        return file.slice(start, end);
    }
}