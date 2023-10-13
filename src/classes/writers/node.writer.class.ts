import { statSync, existsSync, openSync, write, close } from 'fs';
import { join } from 'path';

import { IWriter } from "../../interfaces/writer.interface";

export class NodeWriter implements IWriter<Buffer> {

    private files: { writable: Promise<number> | number, path: string }[] = [];

    constructor(private file?: { name: string },
                private path = '.') { }

    private async create(where?: { path?: string, name: string }) {
        let { name } = this.file || { name: undefined };
        let directory = this.path;

        if (where) {
            name = where.name;
            directory = where.path || this.path;
        }

        if (!name) {
            throw new Error('Needed a file name for the file. Specify at constructor or at write/close moment');
        }
        
        const path = join(directory, name);
        let { writable } = this.files.find((file) => file.path === path) || { };

        if (writable) {
            return writable;
        }

        const exist = existsSync(directory);

        if (!exist) {
            throw new Error('Selected folder doesnt exists.');
        }

        const folder = statSync(directory);

        if (!folder.isDirectory()) {
            throw new Error('Selected folder is not a folder.');
        }

        writable = openSync(path, 'w+');
        this.files.push({ writable, path });

        return writable;
    }

    public async write(data: Buffer, position: number, where?: { path?: string, name: string }) {
        const writable = await this.create(where);

        await new Promise<void>((resolve, reject) => {
            write(writable, data, 0, undefined, position, (err) => err ? reject(err) : resolve());
        });
    };

    public async close(where?: { path?: string, name: string }) {
        const writable = await this.create(where);

        await new Promise((resolve) => close(writable, resolve));
    }
}

