import { IReader } from "../../../interfaces/reader.interface";

type Readable = File & { uuid: string };

export class ChromiumWebReader implements IReader {

    private readables?: Promise<Readable[]> | Readable[];

    constructor() { }

    private async list() {
        const handles = await (window as any).showOpenFilePicker({ multiple: true }) as FileSystemFileHandle[];

        const files = handles.map(async (handle) => {
            const uuid = crypto.randomUUID();
            const file = await handle.getFile();

            Object.defineProperty(file, 'uuid', {
                value: uuid,
                writable: false,
            });

            return file as (File & { uuid: string });
        });

        this.readables = await Promise.all(files);

        return this.readables;
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
            const { name, lastModified, size, type, uuid } = file;
            return { name, lastModified, size, type, uuid };
        });
    }

    public async read(uuid: string, options: { start: number, end: number}) {
        const readables = await this.get();

        const file = readables.find((readable) => readable.uuid === uuid);

        if (!file) {
            throw new Error('File selected not found on list.');
        }

        const { start, end } = options;
        
        return file.slice(start, end);
    }
}