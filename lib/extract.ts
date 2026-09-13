import { extractText as extractPdfText, getDocumentProxy } from "unpdf";

export async function extractText(file: File): Promise<string> {
  const buffer = new Uint8Array(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractPdfText(pdf, { mergePages: true });
    return text;
  }

  if (file.type === "text/plain") {
    return Buffer.from(buffer).toString("utf-8");
  }

  throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
}