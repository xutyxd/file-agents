import { IWriter } from "../../interfaces/writer.interface";

import { ChromiumWebWriter } from "./web/chromium-web.writer.class";
import { GenericWebWriter } from "./web/generic-web.writer.class";

export class WebWriter implements IWriter<WriteParams['data']> {
    private writer: IWriter<WriteParams['data']>;

    constructor(file: { size: number, name: string }, onReady?: Function) {

        if ((window as any).showDirectoryPicker) {
            this.writer = new ChromiumWebWriter(file, onReady);   
        } else {
            this.writer = new GenericWebWriter(file, onReady);
        }
    }

    public async write(data: WriteParams['data'], position: number) {
        this.writer.write(data, position);
    }

    public async close() {
        await this.writer.close();
    }
}