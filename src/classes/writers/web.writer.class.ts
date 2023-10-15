import { IWriter } from "../../interfaces/writer.interface";

import { ChromiumWebWriter } from "./web/chromium-web.writer.class";
import { GenericWebWriter } from "./web/generic-web.writer.class";

export class WebWriter implements IWriter {
    private writer: IWriter;

    constructor() {
        const ctor = (window as any).showDirectoryPicker ? ChromiumWebWriter : GenericWebWriter;
        const writer = new ctor();

        this.writer = writer;
    }

    public create(where: { path?: string | undefined; name: string; size: number}) {
        return this.writer.create(where);
    };

    public write(uuid: string, data: Blob, position: number) {
        return this.writer.write(uuid, data, position);
    }

    public close(uuid: string) {
        return this.writer.close(uuid);
    }
}