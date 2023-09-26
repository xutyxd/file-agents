import { IReader } from "../../interfaces/reader.interface";

export class WebReader implements IReader {

    private readables: File[] = [];

    constructor(onReady?: Function) {
        this.init(onReady);
    }

    private init(onReady?: Function) {
        const input = document.createElement('input');
        input.type = 'file';

        input.onchange = () => {
            this.readables = [ ...input.files as FileList ];

            input.remove();

            if(onReady && typeof onReady === 'function') {
                onReady();
            }
        }

        input.click();
    }

    public files() {
        return this.readables.map((file) => {
            const { name, lastModified, size, type } = file;
            return { name, lastModified, size, type };
        });
    }

    public async read(options: { start: number, end: number}, index = 0) {
        const file = this.readables[index];
        const { start, end } = options;
        
        return file.slice(start, end);
    }

}