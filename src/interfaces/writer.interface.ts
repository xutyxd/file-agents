
export interface IWriter<T> {
    write: (data: T, position: number, where?: { path?: string, name: string }) => Promise<void> | void;
    close: () => Promise<void> | void;
}