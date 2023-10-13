import { NodeWriter } from './node.writer.class';
import { NodeReader } from '../readers/node.reader.class';

const assets = './assets/files';

describe('NodeWriter class', () => {
    describe('NodeWriter instance', () => {
        it('should instance', async () => {

            const nodeWriter = new NodeWriter({ name: 'test.test' }, './test');

            expect(nodeWriter).toBeInstanceOf(NodeWriter);
        });

        it('should instance without specified path', async () => {
            const nodeWriter = new NodeWriter({ name: 'test.test' });

            expect(nodeWriter).toBeInstanceOf(NodeWriter);
        });
    });

    describe('NodeWriter write', () => {
        it('should not write if a name is not defined', async () => {
            const nodeWriter = new NodeWriter();
            let error: Error | void;

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            try {
                error = await nodeWriter.write(buffer, 0);
            } catch(e) {
                error = e as Error;
            }
            
            expect(error as Error).toBeInstanceOf(Error);
            expect((error as Error).message).toBe('Needed a file name for the file. Specify at constructor or at write/close moment');
        });

        it('should throw an error if folder doesnt exists', async () => {
            let result: NodeWriter | Error;

            try {
                result = new NodeWriter({ name: 'test' }, 'assetss');
                await result.write(Buffer.from([]), 0);
            } catch(e) {
                result = e as Error;
            }
            
            expect((result as Error).message).toBe('Selected folder doesnt exists.');
        });

        it ('should throw an error if folder is a file', async () => {
            let result: NodeWriter | Error;

            try {
                result = new NodeWriter({ name: 'test' }, `${assets}/video.mp4`);
                await result.write(Buffer.from([]), 0);
            } catch(e) {
                result = e as Error;
            }
            
            expect((result as Error).message).toBe('Selected folder is not a folder.');
        });

        it('should write', async () => {
            const nodeWriter = new NodeWriter({ name: 'test.test' }, './test');

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            await nodeWriter.write(buffer, 0);

            const nodeReader = new NodeReader('./test');

            const files = await nodeReader.files();
            const { uuid } = files.find(({ name }) => name === 'test.test') as typeof files[number];

            const readed = await nodeReader.read({ start: 0, end: 5 }, uuid);
            const text = await readed.text();

            expect(text).toBe('01234');
        });

        it('should write in the middle', async () => {
            const nodeWriter = new NodeWriter({ name: 'test2.test' }, './test');

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            await nodeWriter.write(buffer, 0);
            await nodeWriter.write(buffer, 1);

            const nodeReader = new NodeReader('./test');

            const files = await nodeReader.files();
            const { uuid } = files.find(({ name }) => name === 'test2.test') as typeof files[number];

            const readed = await nodeReader.read({ start: 0, end: 6 }, uuid);
            const text = await readed.text();

            expect(text).toBe('001234');
        });

        it('should write using where param', async () => {
            const nodeWriter = new NodeWriter();

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const where = { name: 'test3.test', path: './test' };

            await nodeWriter.write(buffer, 0, where);

            const nodeReader = new NodeReader('./test');

            const files = await nodeReader.files();
            const { uuid } = files.find(({ name }) => name === 'test3.test') as typeof files[number];

            const readed = await nodeReader.read({ start: 0, end: 6 }, uuid);
            const text = await readed.text();

            expect(text).toBe('01234');
        });

        it('should write using where param twice in the middle', async () => {
            const nodeWriter = new NodeWriter();

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const where = { name: 'test4.test', path: './test' };

            await nodeWriter.write(buffer, 0, where);
            await nodeWriter.write(buffer, 1, where);

            const nodeReader = new NodeReader('./test');

            const files = await nodeReader.files();
            const { uuid } = files.find(({ name }) => name === 'test4.test') as typeof files[number];

            const readed = await nodeReader.read({ start: 0, end: 6 }, uuid);
            const text = await readed.text();

            expect(text).toBe('001234');
        });

        it('should write using where param without using path', async () => {
            const nodeWriter = new NodeWriter({ name: ''}, './test');

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const where = { name: 'test5.test' };

            await nodeWriter.write(buffer, 0, where);
            await nodeWriter.write(buffer, 1, where);

            const nodeReader = new NodeReader('./test');

            const files = await nodeReader.files();
            const { uuid } = files.find(({ name }) => name === 'test5.test') as typeof files[number];

            const readed = await nodeReader.read({ start: 0, end: 6 }, uuid);
            const text = await readed.text();

            expect(text).toBe('001234');
        });
    });

    describe('NodeWriter close', () => {
        it('should throw an error if try to write on closed file', async () => {
            const nodeWriter = new NodeWriter({ name: 'test.test' }, './test');

            await nodeWriter.close();

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            let result: void | Error;

            try {
                result = await nodeWriter.write(buffer, 0);
            } catch(e) {
                result = e as Error;
            }
            
            expect((result as Error).message).toBe('EBADF: bad file descriptor, write');
        });
        it('should close', async () => {
            const nodeWriter = new NodeWriter({ name: 'test.test' }, './test');

            const result = await nodeWriter.close();

            expect(result).toBe(undefined);
        });

        it('should close a file using where param', async () => {
            const nodeWriter = new NodeWriter({ name: 'test.close' }, './test');

            const result = await nodeWriter.close({ path: './test', name: 'test.close' });

            expect(result).toBe(undefined);
        });
    });
});