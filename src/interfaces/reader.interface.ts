
export interface IReader {
    
    files(): {
        name: string;
        lastModified: number;
        size: number;
        type: string;
    }[]

    read(options: { start: number, end: number }, index?: number): Promise<Blob>;
}