import { NodeReader } from "./node.reader.class";

const assets = './assets/files';

describe('NodeReader class', () => {
    describe('NodeReader instance', () => {
        it('should instance', async () => {
            const nodeReader = new NodeReader(assets);

            expect(nodeReader).toBeInstanceOf(NodeReader);
        });

        it('should instance without specified path', async () => {
            const nodeReader = new NodeReader();

            expect(nodeReader).toBeInstanceOf(NodeReader);
        });
    });

    describe('NodeReader files', () => {

        it('should throw an error if folder doesnt exists', async () => {
            let result: NodeReader | Error;

            try {
                result = new NodeReader('assetss');
                await result.files();
            } catch(e) {
                result = e as Error;
            }
            
            expect((result as Error).message).toBe('Selected folder doesnt exists.');
        });

        it ('should throw an error if folder is a file', async () => {
            let result: NodeReader | Error;

            try {
                result = new NodeReader(`${assets}/video.mp4`);

                await result.files();
            } catch(e) {
                result = e as Error;
            }
            
            expect((result as Error).message).toBe('Selected folder is not a folder.');
        });

        it ('should throw an error if file is not selected', async () => {
            let result: NodeReader | Error;

            try {
                result = new NodeReader(`${assets}/video.mp4`);

                await result.read({ start: 0, end: 15 });
            } catch(e) {
                result = e as Error;
            }
            
            expect((result as Error).message).toBe('File not selected.');
        });

        it('should get files', async () => {
            const nodeReader = new NodeReader(assets);

            const files = await nodeReader.files();
            const [ file ] = files;

            expect(files.length).toBe(1);

            expect(file.name).toBe('video.mp4');
            expect(file.size).toBe(2097084);
        });
    });

    describe('NodeReader read', () => {
        it('should throw an error if file doesnt exists', async () => {
            const nodeReader = new NodeReader(assets);

            let result: Blob | Error;

            try {
                result = await nodeReader.read({ start: 0, end: 15 }, 'uuid');
            } catch(e) {
                result = e as Error;
            }

            expect((result as Error).message).toBe('File selected not found on list.');
        });
        it('should read', async () => {
            const nodeReader = new NodeReader(assets);
            const [{ uuid }] = await nodeReader.files();
            const blob = await nodeReader.read({ start: 0, end: 15 }, uuid);

            expect(blob.size).toBe(15);
        });
    });
});