export function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
        if ((current + sentence).length > chunkSize) {
            chunks.push(current.trim());
            current = current.slice(-overlap) + " " + sentence;

        } else {
            current += " " + sentence;
        }
    }

    if (current.trim()) chunks.push(current.trim());

    return chunks;
}