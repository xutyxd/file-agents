import { IReader } from "../../../interfaces/reader.interface";

type Readable = File & { uuid: string };

export class GenericWebReader implements IReader {

    private readables: Readable[] = [];

    constructor() { }

    private async list() {
        return new Promise<Readable[]>((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            
            input.onchange = () => {
                const files = [ ...input.files as FileList ];
                const newFiles = files.filter((file) => {
                    const names = this.readables.map(({ name }) => name);
                    return !names.includes(file.name);
                })
                const readables = newFiles.map((file) => {
                    const uuid = crypto.randomUUID();
        
                    Object.defineProperty(file, 'uuid', {
                        value: uuid,
                        writable: false,
                    });
        
                    return file as (File & { uuid: string });
                });
    
                input.remove();
                resolve(readables);
            }
    
            input.click();
        });
        
    }

    private get = async () => {
        const files = await this.list();

        files.forEach((readable) => this.readables.push(readable));

        return this.readables;
    }

    public async files() {
        const readables = await this.get();

        return readables.map((file) => {
            const { name, lastModified, size, type, uuid } = file;
            return { name, lastModified, size, type, uuid };
        });
    }

    public async read(uuid: string, options: { start: number, end: number}) {
        const readables = this.readables;

        const file = readables.find((readable) => readable.uuid === uuid);

        if (!file) {
            throw new Error('File selected not found on list.');
        }

        const { start, end } = options;
        
        let blob = file.slice(start, end);
        // Maybe a bug in Chrome
        // Reading last bytes always returns 0
        if (blob.size === 0) {
            blob = file.slice(start);
        }

        return blob;
    }

}