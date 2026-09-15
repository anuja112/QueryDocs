"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type Source = { text: string; documentName: string; score: number };
type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [uploadStatus, setUploadStatus] = useState<Status>("idle");
  const [chunkCount, setChunkCount] = useState<number | null>(null);

  const [question, setQuestion] = useState("");
  const [askStatus, setAskStatus] = useState<Status>("idle");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);

  const [error, setError] = useState("");
  const isReady = uploadStatus === "success";

  async function indexPayload(body: FormData | string, isFile: boolean) {
    setUploadStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: isFile ? undefined : { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");

      setChunkCount(data.chunkCount);
      setUploadStatus("success");
    } catch (err: any) {
      setError(err.message);
      setUploadStatus("error");
    }
  }

  function handleUploadFile() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    indexPayload(formData, true);
  }

  function handleFileDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (
      droppedFile &&
      ["application/pdf", "text/plain"].includes(droppedFile.type)
    ) {
      setFile(droppedFile);
    }
  }

  function handleIndexText() {
    if (!pastedText.trim()) return;
    const formData = new FormData();
    formData.append(
      "file",
      new File([pastedText], "pasted-text.txt", { type: "text/plain" }),
    );
    indexPayload(formData, true);
  }

  async function handleAsk() {
    if (!question.trim()) {
      setError("Please type a question before asking.");
      return;
    }

    setAskStatus("loading");
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setAnswer(data.answer);
      setSources(data.sources || []);
      setAskStatus("success");
    } catch (err: any) {
      setError(err.message);
      setAskStatus("error");
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 md:h-full md:grid-cols-2 md:gap-10 md:overflow-hidden">
      {/* Document context */}
      <section className="workspace-panel flex min-h-0 flex-col gap-4 rounded-2xl p-5 md:h-full md:overflow-hidden md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-[var(--charcoal)]">
            Document context
          </h2>
          <div className="flex items-center gap-2 text-xs text-[var(--slate)]">
            <span>PDF / TXT · 10MB</span>
            {chunkCount !== null && (
              <span className="badge rounded-full px-2.5 py-1 font-medium">
                {chunkCount} chunks indexed
              </span>
            )}
          </div>
        </div>

        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleFileDrop}
          className="input-field flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg px-4 py-10 text-center text-sm"
        >
          <input
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <span className="text-[var(--charcoal)]" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M6 3.75h8l4 4V20a.25.25 0 0 1-.25.25H6.25A.25.25 0 0 1 6 20V3.75Z" />
              <path d="M14 3.75v4h4M12 16V10m0 0-2.5 2.5M12 10l2.5 2.5" />
            </svg>
          </span>
          <span className="font-medium text-[var(--charcoal)]">
            {file ? file.name : "Choose PDF or TXT"}
          </span>
          <span className="text-xs text-[var(--slate)]">
            or drag and drop a file here
          </span>
        </label>

        <button
          onClick={handleUploadFile}
          disabled={!file || uploadStatus === "loading"}
          className="btn-primary w-full rounded-lg py-2.5 text-sm font-medium"
        >
          {uploadStatus === "loading" ? "Processing..." : "Upload file"}
        </button>

        <div className="section-divider flex items-center gap-3 text-xs text-[var(--slate)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--soft)]" />
          <span>or paste text</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--soft)]" />
        </div>

        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste notes or documentation..."
          rows={5}
          className="input-field w-full rounded-lg px-3 py-2.5 text-sm"
        />

        <button
          onClick={handleIndexText}
          disabled={!pastedText.trim() || uploadStatus === "loading"}
          className="btn-outline w-full rounded-lg py-2.5 text-sm font-medium"
        >
          Add text
        </button>
      </section>

      {/* Ask — chat-style panel, scrolls independently of the page */}
      <section className="workspace-panel flex min-h-0 flex-col rounded-2xl p-5 md:h-full md:p-6">
        <h2 className="mb-4 shrink-0 font-medium text-[var(--charcoal)]">
          Ask a question
        </h2>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {!answer && !error && (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <span className="text-sm text-[var(--slate)]">
                {isReady
                  ? "Ask anything about your document."
                  : "Index a document on the left to get started."}
              </span>
            </div>
          )}

          {error && (
            <div
              className="rounded-xl border p-4 text-sm"
              style={{
                borderColor: "#e0b3b3",
                background: "#fdf2f2",
                color: "#8a3b3b",
              }}
            >
              {error}
            </div>
          )}

          {answer && (
            <div className="panel rounded-xl p-5 space-y-2">
              <div className="answer-content text-sm leading-relaxed text-[var(--charcoal)]">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>
          )}

          {sources.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--slate)]">
                Sources ({sources.length})
              </h3>
              {sources.map((s, i) => (
                <div key={i} className="panel rounded-lg p-4 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--slate)]">
                      {s.documentName}
                    </span>
                    <span className="badge rounded-full px-2 py-0.5 text-xs">
                      {(s.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <p className="text-[var(--charcoal)]">
                    {s.text.slice(0, 220)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input pinned to the bottom, chatbox-style */}
        <div className="mt-4 flex shrink-0 items-center gap-2 rounded-xl border border-[var(--soft)] bg-white px-3 py-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            disabled={!isReady}
            placeholder={
              isReady
                ? "Ask about your document..."
                : "Upload or index a document first"
            }
            className="flex-1 bg-transparent px-1 py-2 text-sm focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleAsk}
            disabled={!isReady || askStatus === "loading"}
            className="btn-primary shrink-0 rounded-lg px-4 py-2 text-sm font-medium"
          >
            {askStatus === "loading" ? "..." : "Ask"}
          </button>
        </div>
      </section>
    </div>
  );
}
