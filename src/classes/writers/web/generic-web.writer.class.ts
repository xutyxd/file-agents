import { IWriter } from "../../../interfaces/writer.interface";

export class GenericWebWriter implements IWriter {

    private files: { uuid: string, writable: FileSystemWritableFileStream, folder: FileSystemDirectoryHandle, name: string }[] = [];

    constructor() { }

    public async create(where: { path?: string, name: string, size: number }): Promise<string> {

        const { name, size } = where;
        // Get folder
        const folder = await navigator.storage.getDirectory();
        // Get handle for file
        const fileHandler = await folder.getFileHandle(name, { create: true });
        // Get writable
        const writable = await fileHandler.createWritable({ keepExistingData: false });
        // Truncate needed to avoid error on position that not exist
        writable.truncate(size);

        const file = { uuid: crypto.randomUUID(), writable, folder, name };
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
    };

    public async close(uuid: string) {
        const file = this.get(uuid);

        if (!file) {
            throw new Error('File selected not found');
        }

        const { writable, folder, name } = file;

        try {
            await writable.close();
        } catch(e) {
            console.log('Error closing: ', e);
            throw e;
        }

        try {
            const fileHandler = await folder.getFileHandle(name, { create: false });
            const file = await fileHandler.getFile();
            const blob = file.slice(0, file.size);

            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            a.style.display = 'none';
            document.body.append(a);
            // Programmatically click the element.
            a.click();
            // Revoke the blob URL and remove the element.
            setTimeout(() => {
                URL.revokeObjectURL(url);
                a.remove();
            }, 1000);
        } catch(e) {
            console.log('Error trying to get file for download.');
        }
    }
}