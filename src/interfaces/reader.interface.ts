
export interface IReader {
    
    files(): Promise<{
        uuid: string;
        name: string;
        lastModified: number;
        size: number;
        type: string;
    }[]>;

    read(options: { start: number, end: number }, file?: string): Promise<Blob> | Blob;
}