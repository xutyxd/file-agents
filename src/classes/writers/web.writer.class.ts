import { IWriter } from "../../interfaces/writer.interface";

import { ChromiumWebWriter } from "./web/chromium-web.writer.class";
import { GenericWebWriter } from "./web/generic-web.writer.class";

export class WebWriter implements IWriter<WriteParams['data']> {
    private writer: IWriter<WriteParams['data']>;

    constructor(file: { size: number, name: string }) {
        const ctor = (window as any).showDirectoryPicker ? ChromiumWebWriter : GenericWebWriter;
        const writer = new ctor(file);

        this.writer = writer;
    }

    public write(data: WriteParams['data'], position: number) {
        return this.writer.write(data, position);
    }

    public close() {
        return this.writer.close();
    }
}