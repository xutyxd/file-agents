import { NodeWriter } from './node.writer.class';
import { NodeReader } from '../readers/node.reader.class';

const assets = './assets/files';

describe('NodeWriter class', () => {
    describe('NodeWriter instance', () => {
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
            const nodeWriter = new NodeWriter({ name: 'test.test' }, './test');

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            await nodeWriter.write(buffer, 0);
            await nodeWriter.write(buffer, 1);

            const nodeReader = new NodeReader('./test');

            const files = await nodeReader.files();
            const { uuid } = files.find(({ name }) => name === 'test.test') as typeof files[number];

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
    });
});