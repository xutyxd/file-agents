import { IReader } from "../../interfaces/reader.interface";
import { ChromiumWebReader } from "./web/chromium-web.reader.class";
import { GenericWebReader } from "./web/generic-web.reader.class";

export class WebReader implements IReader {

    private reader: IReader;

    constructor() {
        const ctor = (window as any).showOpenFilePicker ? ChromiumWebReader : GenericWebReader;
        const reader = new ctor();

        this.reader = reader;
    }

    public files() {
        return this.reader.files();
    }

    public read(options: { start: number, end: number}, uuid?: string) {
        return this.reader.read(options, uuid);
    }

}