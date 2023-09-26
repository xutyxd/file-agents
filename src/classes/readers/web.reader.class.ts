import { IReader } from "../../interfaces/reader.interface";
import { ChromiumWebReader } from "./web/chromium-web.reader.class";
import { GenericWebReader } from "./web/generic-web.reader.class";

export class WebReader implements IReader {

    private reader!: IReader;

    public on!: {
        ready: Promise<void>
    }

    constructor() {
        this.on = {
            ready: this.init()
        }
    }

    private init() {
        const ctor = (window as any).showOpenFilePicker ? ChromiumWebReader : GenericWebReader;
        const reader = new ctor();

        this.reader = reader;
        return reader.on.ready;
    }

    public files() {
        return this.reader.files();
    }

    public read(options: { start: number, end: number}, index = 0) {
        return this.reader.read(options, index);
    }

}