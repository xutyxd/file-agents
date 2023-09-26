import { statSync, existsSync, openSync, write, close } from 'fs';
import { join } from 'path';

import { IWriter } from "../../interfaces/writer.interface";

export class NodeWriter implements IWriter<Buffer> {

    private writable!: number;

    public on!: {
        ready: Promise<void>
    }

    constructor(file: { size: number, name: string }, path = '.',) {
        this.on = {
            ready: this.init(file, path)
        }
    }

    private async init(file: { size: number, name: string }, where: string) {
        const exist = existsSync(where);

        if (!exist) {
            throw new Error('Selected folder doesnt exists.');
        }

        const folder = statSync(where);

        if (!folder.isDirectory()) {
            throw new Error('Selected folder is not a folder.');
        }

        const path = join(where, file.name);
        this.writable = openSync(path, 'w+');
    }

    public async write(data: Buffer, position: number) {
        await new Promise<void>((resolve, reject) => {
            write(this.writable, data, 0, undefined, position, (err) => err ? reject(err) : resolve());
        });
    };

    public async close() {
        await new Promise((resolve) => close(this.writable, resolve));
    }
}

