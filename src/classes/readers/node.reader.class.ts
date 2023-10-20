import { readdirSync, statSync, openAsBlob, existsSync, read } from 'fs';
import { open } from 'fs/promises';
import { join } from 'path';

import { IReader } from "../../interfaces/reader.interface";

type Readable = { lastModified: number, uuid: string, size: number, name: string, type: string, slice: (start: number, end: number) => Promise<Blob> };

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
            const handle = await open(path, 'r');
            const blob: Readable = {
                lastModified: Math.round(stat.mtimeMs),
                name,
                size: stat.size,
                uuid: crypto.randomUUID(),
                type: '',
                slice: async (start, end) => {
                    const readed = Buffer.alloc(end - start);
                    await handle.read(readed, 0, end - start, start);
                    return new Blob([ readed ]);
                }
            };

            return blob;
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

        const blob = await file.slice(start, end);

        return blob;
    }
}