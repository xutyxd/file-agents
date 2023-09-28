import { IReader } from "../../../interfaces/reader.interface";

type Readable = File & { uuid: string };

export class GenericWebReader implements IReader {

    private readables?: Promise<Readable[]> | Readable[];
    private selected?: string;

    constructor() { }

    private async list() {
        return new Promise<Readable[]>((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            
            input.onchange = () => {
                const files = [ ...input.files as FileList ];
                this.readables = files.map((file) => {
                    const uuid = crypto.randomUUID();
        
                    Object.defineProperty(file, 'uuid', {
                        value: uuid,
                        writable: false,
                    });
        
                    return file as (File & { uuid: string });
                });
    
                input.remove();
                resolve(this.readables);
            }
    
            input.click();
        });
        
    }

    private get = async () => {
        let readables = this.readables;

        if (!readables) {
            readables = this.list();
        }

        if (readables instanceof Promise) {
            readables = await readables;
        }

        return readables;
    }

    public async files() {
        const readables = await this.get();

        return readables.map((file) => {
            const { name, lastModified, size, type } = file;
            return { name, lastModified, size, type };
        });
    }

    public async read(options: { start: number, end: number}, selected = this.selected) {
        if (!selected) {
            throw new Error(`File not selected.`);
        }

        const readables = await this.get();

        const file = readables.find(({ uuid }) => uuid === selected);

        if (!file) {
            throw new Error('File selected not found on list.');
        }

        const { start, end } = options;
        
        return file.slice(start, end);
    }

}