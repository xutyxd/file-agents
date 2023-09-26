import { NodeReader } from "./node.reader.class";

const assets = './assets/files';

describe('NodeReader class', () => {
    describe('NodeReader instance', () => {
        it('should throw an error if folder doesnt exists', async () => {
            let result: NodeReader | Error;

            try {
                result = new NodeReader('assetss');
                await result.on.ready;
            } catch(e) {
                result = e as Error;
            }
            
            expect((result as Error).message).toBe('Selected folder doesnt exists.');
        });

        it ('should throw an error if folder is a file', async () => {
            let result: NodeReader | Error;

            try {
                result = new NodeReader(`${assets}/video.mp4`);
                await result.on.ready;
            } catch(e) {
                result = e as Error;
            }
            
            expect((result as Error).message).toBe('Selected folder is not a folder.');
        });
        it('should instance', async () => {
            const nodeReader = new NodeReader(assets);
            await nodeReader.on.ready;

            expect(nodeReader).toBeInstanceOf(NodeReader);
        });

        it('should instance without specified path', async () => {
            const nodeReader = new NodeReader();
            await nodeReader.on.ready;

            expect(nodeReader).toBeInstanceOf(NodeReader);
        });
    });

    describe('NodeReader files', () => {
        it('should get files', async () => {
            const nodeReader = new NodeReader(assets);
            await nodeReader.on.ready;

            const files = nodeReader.files();
            const [ file ] = files;

            expect(files.length).toBe(1);

            expect(file.name).toBe('video.mp4');
            expect(file.size).toBe(2097084);
        });
    });

    describe('NodeReader read', () => {
        it('should throw an error if file out of range', async () => {
            const nodeReader = new NodeReader(assets);
            await nodeReader.on.ready;

            let result: Blob | Error;

            try {
                result = nodeReader.read({ start: 0, end: 15 }, 1);
            } catch(e) {
                result = e as Error;
            }

            expect((result as Error).message).toBe('File index selected out of range. Valid range: 0 - 0');
        });
        it('should read', async () => {
            const nodeReader = new NodeReader(assets);
            await nodeReader.on.ready;

            const blob = nodeReader.read({ start: 0, end: 15 });

            expect(blob.size).toBe(15);
        });
    });
});