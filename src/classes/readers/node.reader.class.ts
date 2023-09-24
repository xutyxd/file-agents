import { readdirSync, statSync, openAsBlob, existsSync } from 'fs';

import { IReader } from "../../interfaces/reader.interface";
import { FileLike } from '../files/file-like.class';

export class NodeReader implements IReader {

    private readables: FileLike[] = [];

    constructor(path = '', onReady?: Function) {
            this.init(path, onReady);
    }

    private async init(path: string, onReady?: Function) {
        const exist = existsSync(path);

        if (!exist) {
            throw new Error('Selected folder doesnt exists.');
        }

        const folder = statSync(path);

        if (!folder.isDirectory()) {
            throw new Error('Selected folder is not a folder.');
        }

        const paths = readdirSync(path, { encoding: 'binary' });

        const stats = paths.map((path) => ({ path, stat: statSync(path) }));

        const fileStats = stats.filter(({ stat }) => stat.isFile());

        this.readables = await Promise.all(fileStats.map(async ({ path, stat }) => {
            const blob = await openAsBlob(path);
            return new FileLike(blob, { ...stat, name: path })
        }));

        if(onReady && typeof onReady === 'function') {
            onReady();
        }
    }

    public files() {
        return this.readables.map((file) => {
            const { name, lastModified, size, type } = file;
            return { name, lastModified, size, type };
        });
    }

    public async read(options: { start: number, end: number}, index = 0) {
        const file = this.readables[index];
        const { start, end } = options;
        
        return file.slice(start, end);
    }
}