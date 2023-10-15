import { statSync, existsSync, openSync, write, close } from 'fs';
import { join } from 'path';

import { IWriter } from "../../interfaces/writer.interface";

export class NodeWriter implements IWriter {

    private files: { uuid: string, writable: number, path: string }[] = [];

    constructor(private path = '.') { }

    public create(where: { path?: string, name: string }) {
        
        const { path: directory = this.path, name } = where;

        const exist = existsSync(directory);

        if (!exist) {
            throw new Error('Selected folder doesnt exists.');
        }

        const folder = statSync(directory);

        if (!folder.isDirectory()) {
            throw new Error('Selected folder is not a folder.');
        }

        const path = join(directory, name);

        const writable = openSync(path, 'w+');
        const file = { uuid: crypto.randomUUID(), writable, path };
        this.files.push(file);

        return file.uuid;
    }

    private get(uuid: string) {
        const file = this.files.find((file) => file.uuid === uuid);

        if (!file) {
            throw new Error('File selected not found');
        }

        return file;
    }

    public async write(uuid: string, data: Blob, position: number) {

        const file = this.get(uuid);
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await new Promise<void>((resolve, reject) => {
            write(file.writable, buffer, 0, undefined, position, (err) => err ? reject(err) : resolve());
        });
    };

    public async close(uuid: string) {
        const file = this.get(uuid);
        await new Promise((resolve) => close(file.writable, resolve));
    }
}

