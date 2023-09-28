import { IWriter } from "../../../interfaces/writer.interface";

export class GenericWebWriter implements IWriter<WriteParams['data']> {

    private folder!: FileSystemDirectoryHandle;
    private writable?: Promise<FileSystemWritableFileStream> | FileSystemWritableFileStream;

    constructor(private file: { size: number, name: string }) { }

    private async create(): Promise<FileSystemWritableFileStream> {

        const { name, size } = this.file;
        // Get folder
        const folder = this.folder = await navigator.storage.getDirectory();
        // Get handle for file
        const fileHandler = await folder.getFileHandle(name, { create: true });
        // Get writable
        this.writable = await fileHandler.createWritable({ keepExistingData: false });
        // Truncate needed to avoid error on position that not exist
        this.writable.truncate(size);

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


    public async write(data: WriteParams['data'], position: number) {

        const writable = await this.get();

        try {
            await writable.write({ type: 'write', position, data });
        } catch(e) {
            console.log('Error writing...', e);
            throw e;
        } 
    };

    public async close() {
        const writable = await this.get();

        try {
            await writable.close();
        } catch(e) {
            console.log('Error closing: ', e);
            throw e;
        }

        try {
            const fileHandler = await this.folder.getFileHandle(this.file.name, { create: false });
            const file = await fileHandler.getFile();
            const blob = file.slice(0, file.size);

            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = this.file.name;
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