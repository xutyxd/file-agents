import { IWriter } from "../../../interfaces/writer.interface";

export class GenericWebWriter implements IWriter<WriteParams['data']> {

    private folder!: FileSystemDirectoryHandle;
    private writable!: FileSystemWritableFileStream;

    constructor(private file: { size: number, name: string }, onReady?: Function) {
        this.init(file, onReady);
    }

    private async init(file: { size: number, name: string }, onReady?: Function) {
        // Get folder
        const folder = this.folder = await navigator.storage.getDirectory();
        // Get handle for file
        const fileHandler = await folder.getFileHandle(file.name, { create: true });
        // Get writable
        this.writable = await fileHandler.createWritable({ keepExistingData: false });
        // Truncate needed to avoid error on position that not exist
        this.writable.truncate(file.size);
        // If callback execute it
        if (onReady) {
            onReady();
        }
    }


    public async write(data: WriteParams['data'], position: number) {
        try {
            await this.writable.write({ type: 'write', position, data });
        } catch(e) {
            console.log('Error writing...', e);
            throw e;
        } 
    };

    public async close() {
        try {
            await this.writable.close();
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