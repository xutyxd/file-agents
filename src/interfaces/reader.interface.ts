
export interface IReader {
    
    files(): Promise<{
        uuid: string;
        name: string;
        lastModified: number;
        size: number;
        type: string;
    }[]>;

    read(uuid: string, options: { start: number, end: number }): Promise<Blob> | Blob;
}