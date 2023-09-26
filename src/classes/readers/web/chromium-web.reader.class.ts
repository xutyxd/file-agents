import { IReader } from "../../../interfaces/reader.interface";


export class ChromiumWebReader implements IReader {

    private readables: File[] = [];

    public on!: {
        ready: Promise<void>
    }

    constructor() {
        this.on = {
            ready: this.init()
        }
    }

    private async init() {
        const handles = await (window as any).showOpenFilePicker({ multiple: true }) as FileSystemFileHandle[];
        this.readables = await Promise.all(handles.map(async (handle) => await handle.getFile()));
    }

    public files() {
        return this.readables.map((file) => {
            const { name, lastModified, size, type } = file;
            return { name, lastModified, size, type };
        });
    }

    public read(options: { start: number, end: number}, index = 0) {
        const file = this.readables[index];

        if (!file) {
            throw new Error(`File index selected out of range. Valid range: 0 - ${this.readables.length - 1}`);
        }

        const { start, end } = options;
        
        return file.slice(start, end);
    }
}