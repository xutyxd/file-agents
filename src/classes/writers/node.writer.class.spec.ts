import { NodeWriter } from './node.writer.class';
import { NodeReader } from '../readers/node.reader.class';

const assets = './assets/files';

describe('NodeWriter class', () => {
    describe('NodeWriter instance', () => {
        it('should instance', async () => {

            const nodeWriter = new NodeWriter('./test');

            expect(nodeWriter).toBeInstanceOf(NodeWriter);
        });

        it('should instance without specified path', async () => {
            const nodeWriter = new NodeWriter();

            expect(nodeWriter).toBeInstanceOf(NodeWriter);
        });
    });

    describe('NodeWriter create', () => {
        it('should throw an error if folder doesnt exists', async () => {
            let result = new Error();

            try {
                const writer = new NodeWriter('assetss');
                writer.create({ name: 'test.test' });
            } catch(e) {
                result = e as Error;
            }
            
            expect(result.message).toBe('Selected folder doesnt exists.');
        });

        it ('should throw an error if folder is a file', async () => {
            let result = new Error();

            try {
                const writer = new NodeWriter(`${assets}/video.mp4`);
                writer.create({ name: 'test.test' });
            } catch(e) {
                result = e as Error;
            }
            
            expect(result.message).toBe('Selected folder is not a folder.');
        });

        it('should create a file', () => {
            const writer = new NodeWriter('./test');
            const file = writer.create({ name: 'test-create.test' });

            expect(file).toBeTruthy();
        });

        it('should create a file using path', () => {
            const writer = new NodeWriter();
            const file = writer.create({ name: 'test-create.test', path: './test' });

            expect(file).toBeTruthy();
        });
    });
    describe('NodeWriter write', () => {

        it('should throw and error writing a non existent file', async () => {
            const nodeWriter = new NodeWriter('./test');

            let result = new Error();
            try {
                const result = await nodeWriter.write('file', new Blob(), 10);
            } catch(e) {
                result = e as Error;
            }
            

            expect(result.message).toBe('File selected not found');
        });

        it('should write', async () => {
            const nodeWriter = new NodeWriter('./test');
            const file = nodeWriter.create({ name: 'test.test' })

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);

            await nodeWriter.write(file, blob, 0);

            const nodeReader = new NodeReader('./test');

            const files = await nodeReader.files();
            const { uuid } = files.find(({ name }) => name === 'test.test') as typeof files[number];

            const readed = await nodeReader.read(uuid, { start: 0, end: 5 });
            const text = await readed.text();

            expect(text).toBe('01234');
        });

        it('should write in the middle', async () => {
            const nodeWriter = new NodeWriter('./test');
            const file = nodeWriter.create({ name: 'test2.test' });

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);

            await nodeWriter.write(file, blob, 0);
            await nodeWriter.write(file, blob, 1);

            const nodeReader = new NodeReader('./test');

            const files = await nodeReader.files();
            const { uuid } = files.find(({ name }) => name === 'test2.test') as typeof files[number];

            const readed = await nodeReader.read(uuid, { start: 0, end: 6 });
            const text = await readed.text();

            expect(text).toBe('001234');
        });
    });

    describe('NodeWriter close', () => {
        it('should throw an error if try to write on closed file', async () => {
            const nodeWriter = new NodeWriter('./test');
            const file = nodeWriter.create({ name: 'test3.test' });
            await nodeWriter.close(file);

            const blob = new Blob([0, 1, 2, 3, 4] as unknown as BlobPart[]);

            let result: void | Error;

            try {
                result = await nodeWriter.write(file, blob, 0);
            } catch(e) {
                result = e as Error;
            }
            
            expect((result as Error).message).toBe('EBADF: bad file descriptor, write');
        });

        it('should throw and error closing a non existent file', async () => {
            const nodeWriter = new NodeWriter('./test');

            let result = new Error();
            try {
                const result = await nodeWriter.close('file');
            } catch(e) {
                result = e as Error;
            }
            

            expect(result.message).toBe('File selected not found');
        });

        it('should close', async () => {
            const nodeWriter = new NodeWriter('./test');
            const file = nodeWriter.create({ name: 'test4.test' });
            const result = await nodeWriter.close(file);

            expect(result).toBe(undefined);
        });
    });
});