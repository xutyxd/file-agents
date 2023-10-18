import { readdirSync, statSync, openAsBlob, existsSync } from 'fs';
import { join } from 'path';

import { IReader } from "../../interfaces/reader.interface";

type Readable = Blob & { lastModified: number, uuid: string, name: string };

export class NodeReader implements IReader {

    private readables: Readable[] = [];

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
        const newFiles = files.filter((file) => {
            const names = this.readables.map(({ name }) => name);
            return !names.includes(file);
        });
        const stats = newFiles.map((file) => ({ path: join(where, file), stat: statSync(join(where, file)), name: file }));
        const fileStats = stats.filter(({ stat }) => stat.isFile());

        const readables = await Promise.all(fileStats.map(async ({ path, stat, name }) => {
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

        return readables;
    }

    private get = async () => {
        const files = await this.list();
        files.forEach((readable) => this.readables.push(readable));

        return this.readables;
    }

    public async files() {

        const readables = await this.get();

        return readables.map((file) => {
            const { name, lastModified, size, type, uuid } = file;
            return { name, lastModified, size, type, uuid };
        });
    }

    public async read(uuid: string, options: { start: number, end: number}): Promise<Blob> {
        const readables = this.readables;

        const file = readables.find((readable) => readable.uuid === uuid);

        if (!file) {
            throw new Error('File selected not found on list.');
        }

        const { start, end } = options;
        
        let blob = file.slice(start, end);
        // Reading last bytes always returns 0 idk
        if (blob.size === 0) {
            blob = file.slice(start);
        }

        return blob;
    }
}