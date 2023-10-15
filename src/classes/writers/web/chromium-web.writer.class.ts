import { IWriter } from "../../../interfaces/writer.interface";

export class ChromiumWebWriter implements IWriter {

    private files: { uuid: string, writable: FileSystemWritableFileStream }[] = [];

    constructor() { }

    public async create(where: { path?: string, name: string, size: number }) {

        const { name, size } = where;
        // Get folder
        const folder = await (window as any).showDirectoryPicker() as FileSystemDirectoryHandle; 
        // Get handle for file
        const fileHandler = await folder.getFileHandle(name, { create: true });
        // Get writable
        const writable = await fileHandler.createWritable({ keepExistingData: false });
        // Truncate needed to avoid error on position that not exist
        writable.truncate(size);

        const file = { uuid: crypto.randomUUID(), writable };
        this.files.push(file);

        return file.uuid;
    }

    private get(uuid: string) {
        return this.files.find((file) => file.uuid === uuid);
    }

    public async write(uuid: string, data: Blob, position: number) {
        const file = this.get(uuid);

        if (!file) {
            throw new Error('File selected not found');
        }

        const { writable } = file;

        try {
            await writable.write({ type: 'write', position, data });
        } catch(e) {
            console.log('Error writing...', e);
            throw e;
        }        
    }

    public async close(uuid: string) {

        const file = this.get(uuid);

        if (!file) {
            throw new Error('File selected not found');
        }

        const { writable } = file;

        try {
            await writable.close();
        } catch(e) {
            console.log('Error closing: ', e);
            throw e;
        }
    }
}