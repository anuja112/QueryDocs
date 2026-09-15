import { chunkText } from "@/lib/chunk";
import { extractText } from "@/lib/extract";
import { embedText } from "@/lib/gemini";
import { Chunk, replaceDocumentChunks } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
        }
        if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
            { error: "File too large (max 10MB)." },
            { status: 400 },
        );
        }

        const text = await extractText(file);
        if (!text || text.trim().length < 20) {
        return NextResponse.json(
            { error: "Couldn't read meaningful text from this file." },
            { status: 400 },
        );
        }

        const chunks = chunkText(text);

        const indexedChunks: Chunk[] = [];
        for (let i = 0; i < chunks.length; i++) {
        const embedding = await embedText(chunks[i]);
        indexedChunks.push({
            id: `${file.name}-${i}`,
            documentName: file.name,
            text: chunks[i],
            embedding,
        });
        }

        replaceDocumentChunks(file.name, indexedChunks);

        return NextResponse.json({ success: true, chunkCount: chunks.length });
    } catch (err: any) {
        return NextResponse.json(
        { error: err.message || "Upload failed." },
        { status: 500 },
        );
    }
}
