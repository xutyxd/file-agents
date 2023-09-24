import { Stats } from 'fs';

export class FileLike implements Pick<Blob, keyof Blob> {

    public name;
    public size;
    public lastModified;
    public type;
    public arrayBuffer;
    public slice;
    public stream;
    public text;
    public prototype

    constructor(blob: Blob, stat: Pick<Stats, 'mtimeMs'> & { name: string }) {
        
        this.name = stat.name;
        this.size = blob.size;
        this.type = blob.type;
        this.lastModified = Math.round(stat.mtimeMs);
        this.arrayBuffer = blob.arrayBuffer;
        this.slice = blob.slice;
        this.stream = blob.stream;
        this.text = blob.text;
        this.prototype = blob.prototype;
    }
}