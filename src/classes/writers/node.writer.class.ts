import { statSync, existsSync, openSync, write, close } from 'fs';
import { join } from 'path';

import { IWriter } from "../../interfaces/writer.interface";

export class NodeWriter implements IWriter<Buffer> {

    private writable?: Promise<number> | number;

    constructor(private file: { name: string }, private path = '.',) { }

    private async create() {
        const { name } = this.file;
        const where = this.path;

        const exist = existsSync(where);

        if (!exist) {
            throw new Error('Selected folder doesnt exists.');
        }

        const folder = statSync(where);

        if (!folder.isDirectory()) {
            throw new Error('Selected folder is not a folder.');
        }

        const path = join(where, name);
        this.writable = openSync(path, 'w+');

        return this.writable;
    }

    private get = async () => {
        let writable = this.writable;

        if (!writable) {
            writable = this.create();
        }

        if (writable instanceof Promise) {
            writable = await writable;
        }

        return writable;
    }

    public async write(data: Buffer, position: number) {
        const writable = await this.get();

        await new Promise<void>((resolve, reject) => {
            write(writable, data, 0, undefined, position, (err) => err ? reject(err) : resolve());
        });
    };

    public async close() {
        const writable = await this.get();

        await new Promise((resolve) => close(writable, resolve));
    }
}

