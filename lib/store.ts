//database
export type Chunk = {
    id: string;
    documentName: string;
    text: string;
    embedding: number[];
};

export const chunkStore: Chunk[] = [];