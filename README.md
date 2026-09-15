# <img src="public/file.svg" alt="QueryDocs icon" width="28" height="28" /> QueryDocs

QueryDocs is a document-grounded question-answering assistant. Upload a PDF or TXT document, or paste text directly, and ask questions about its contents. Answers are generated from retrieved document chunks rather than general model memory.

## Features

- Upload PDF and TXT files up to 10 MB
- Paste notes or documentation into the knowledge base
- Split documents into overlapping chunks for retrieval
- Generate Gemini embeddings for indexed chunks and questions
- Rank relevant context with cosine similarity
- Remove duplicate chunks from retrieval results
- Replace previously indexed chunks when the same document is uploaded again
- Return source excerpts with similarity scores
- Render generated answers with headings, emphasis, and lists
- Drag-and-drop file selection with a responsive two-column interface

## How It Works

```text
Document or pasted text
        |
        v
Text extraction -> Chunking -> Gemini embeddings -> In-memory chunk store
                                                        |
Question -> Gemini embedding -> Cosine similarity -> Top context chunks
                                                        |
                                                        v
                                      Grounded Gemini answer + sources
```

The upload route extracts text, creates chunks, embeds each chunk, and replaces any existing chunks for the same document. The ask route embeds the question, ranks stored chunks, filters identical text, and sends the highest-scoring context to Gemini with grounding instructions.

## Tech Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Google Gemini API for embeddings and answer generation
- `unpdf` for PDF text extraction
- `react-markdown` for answer rendering
- Tailwind CSS 4

## Getting Started

### Prerequisites

- Node.js 20 or newer
- A Google Gemini API key

### Installation

```bash
git clone <your-repository-url>
cd querydocs
npm install
```

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Start the production server
npm run lint     # Run ESLint
```

## Project Structure

```text
app/
  api/ask/route.ts       # Question answering and retrieval
  api/upload/route.ts    # File parsing, chunking, and indexing
  globals.css            # Shared theme and component styles
  layout.tsx             # Application shell and metadata
  page.tsx               # Upload and Q&A interface
lib/
  chunk.ts               # Text chunking
  extract.ts             # PDF and TXT extraction
  gemini.ts              # Embedding and generation helpers
  similarity.ts          # Cosine similarity calculation
  store.ts               # In-memory chunk store
public/                  # Static assets
```

## Current Limitations

- Indexed documents are stored in memory and are cleared when the server restarts.
- The current extractor supports PDF and TXT files. Markdown files can be pasted as text, but there is not yet a dedicated `.md` upload path.
- Retrieval uses an in-memory linear scan rather than a persistent vector database or FAISS index.
- Embeddings are generated sequentially during indexing.
- Authentication, document-level access control, and persistent user workspaces are not included.

## License

This project is for learning and demonstration purposes.
