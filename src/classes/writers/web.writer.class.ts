import { IWriter } from "../../interfaces/writer.interface";

import { ChromiumWebWriter } from "./web/chromium-web.writer.class";
import { GenericWebWriter } from "./web/generic-web.writer.class";

export class WebWriter implements IWriter<WriteParams['data']> {
    private writer: IWriter<WriteParams['data']>;

    public on!: {
        ready: Promise<void>
    }

    constructor(file: { size: number, name: string }) {
        const ctor = (window as any).showDirectoryPicker ? ChromiumWebWriter : GenericWebWriter;
        const writer = new ctor(file);

        this.writer = writer;

        this.on = {
            ready: writer.on.ready
        }
    }

    public async write(data: WriteParams['data'], position: number) {
        return this.writer.write(data, position);
    }

    public async close() {
        await this.writer.close();
    }
}