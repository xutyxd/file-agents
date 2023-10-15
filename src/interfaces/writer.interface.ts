
export interface IWriter {
    create: (where: { path?: string, name: string, size: number }) => Promise<string> | string;
    write: (uuid: string, data: Blob, position: number) => Promise<void> | void;
    close: (uuid: string) => Promise<void> | void;
}