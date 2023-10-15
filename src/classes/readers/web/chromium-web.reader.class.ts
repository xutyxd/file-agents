import { IReader } from "../../../interfaces/reader.interface";

type Readable = File & { uuid: string };

export class ChromiumWebReader implements IReader {

    private readables: Readable[] = [];

    constructor() { }

    private async list() {
        const handler = await (window as any).showOpenFilePicker({ multiple: true }) as FileSystemFileHandle[];

        const handlers = handler.filter((file) => {
            const names = this.readables.map(({ name }) => name);
            return !names.includes(file.name);
        });

        const files = handlers.map(async (handle) => {
            const uuid = crypto.randomUUID();
            const file = await handle.getFile();

            Object.defineProperty(file, 'uuid', {
                value: uuid,
                writable: false,
            });

            return file as (File & { uuid: string });
        });

        return await Promise.all(files);
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
        
        return file.slice(start, end);
    }
}