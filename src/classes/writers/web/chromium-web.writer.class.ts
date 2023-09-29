import { IWriter } from "../../../interfaces/writer.interface";

export class ChromiumWebWriter implements IWriter<WriteParams['data']> {

    private writable?: Promise<FileSystemWritableFileStream> | FileSystemWritableFileStream;

    constructor(private file: { size: number, name: string }) { }

    private async create() {

        const { name, size } = this.file;
        // Get folder
        const folder = await (window as any).showDirectoryPicker() as FileSystemDirectoryHandle; 
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
    }

    public async close() {

        const writable = await this.get();

        try {
            await writable.close();
        } catch(e) {
            console.log('Error closing: ', e);
            throw e;
        }
    }
}