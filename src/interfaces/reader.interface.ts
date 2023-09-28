
export interface IReader {
    
    files(): Promise<{
        name: string;
        lastModified: number;
        size: number;
        type: string;
    }[]>;

    read(options: { start: number, end: number }, file?: string): Promise<Blob> | Blob;
}