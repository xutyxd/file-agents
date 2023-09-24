import { IWriter } from "../../../interfaces/writer.interface";

export class ChromiumWebWriter implements IWriter<WriteParams['data']> {
    
    private folder!: FileSystemDirectoryHandle;
    private writable!: FileSystemWritableFileStream;

    constructor(private file: { size: number, name: string }, onReady?: Function) {
        this.init(file, onReady);
    }

    private async init(file: { size: number, name: string }, onReady?: Function) {
        // Get folder
        const folder = await (window as any).showSaveFilePicker() as FileSystemDirectoryHandle; 
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
    }

    public async close() {
        try {
            await this.writable.close();
        } catch(e) {
            console.log('Error closing: ', e);
            throw e;
        }
    }
}