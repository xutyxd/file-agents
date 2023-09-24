import { FileLike } from './file-like.class';

describe('FileLike class', () => {
    describe('FileLike instance', () => {
        it('should instance', () => {
            const fileLike = new FileLike(new Blob([]), { name: 'test', mtimeMs: 1000 });

            expect(fileLike).toBeInstanceOf(FileLike);
        });
    });
});