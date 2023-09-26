import { IReader } from "../../../interfaces/reader.interface";

export class GenericWebReader implements IReader {

    private readables: File[] = [];

    public on!: {
        ready: Promise<void>
    }

    constructor() {
        this.on = {
            ready: this.init()
        }
    }

    private init() {

        return new Promise<void>((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            
            input.onchange = () => {
                this.readables = [ ...input.files as FileList ];
    
                input.remove();
                resolve();
            }
    
            input.click();
        });
        
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