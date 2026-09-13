import { NextRequest, NextResponse } from "next/server";
import { embedText, generateAnswer } from "@/lib/gemini";
import { cosineSimilarity } from "@/lib/similarity";
import { chunkStore } from "@/lib/store";

const SIMILARITY_THRESHOLD = 0.65;
const TOP_K = 4;

export async function POST(req: NextRequest) {
    try {
        const { question } = await req.json();

        if (!question || question.trim().length === 0) {
            return NextResponse.json({ error: "Question cannot be empty." }, 
                { status: 400 });
        }
        if (chunkStore.length === 0) {
            return NextResponse.json({ error: "Please upload a document first." }, 
                { status: 400 });
        }

        const questionEmbedding = await embedText(question);

        const scored = chunkStore.map((chunk) => ({ ...chunk, score: cosineSimilarity(questionEmbedding, chunk.embedding) }))
            .sort((a, b) => b.score - a.score);
        const topChunks = scored.slice(0, TOP_K);

        if (topChunks[0].score < SIMILARITY_THRESHOLD) {
            return NextResponse.json({
                answer: "I couldn't find this in the uploaded document.",
                sources: [],
            });
        }

        const prompt = ` You are a document assistant. Answer ONLY using the context below. If the answer is not in the context, say: "I couldn't find this in the uploaded document." Do not use any outside knowledge. 

        Context: ${topChunks.map((c) => c.text).join("\n\n---\n\n")}

        Question: ${question} `;

        const answer = await generateAnswer(prompt);
        return NextResponse.json({
            answer,
            sources: topChunks.map((c) => ({
                text: c.text,
                documentName: c.documentName,
                score: c.score,
            })),
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Failed to answer question." }, 
            { status: 500 });
    }
}