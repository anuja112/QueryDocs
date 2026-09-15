//database
export type Chunk = {
    id: string;
    documentName: string;
    text: string;
    embedding: number[];
};

export const chunkStore: Chunk[] = [];

export function replaceDocumentChunks(documentName: string, chunks: Chunk[]) {
    for (let index = chunkStore.length - 1; index >= 0; index--) {
        if (chunkStore[index].documentName === documentName) {
        chunkStore.splice(index, 1);
        }
    }

    chunkStore.push(...chunks);
}
