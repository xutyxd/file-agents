
export interface IWriter<T> {
    write: (data: T, position: number) => Promise<void> | void;
    close: () => Promise<void> | void;
}