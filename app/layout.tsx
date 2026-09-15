import type { Metadata } from "next";
import { Manrope, Ruwudu } from "next/font/google";
import "./globals.css";
import questionTalk from "./question-talk.png";

const font = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const titleFont = Ruwudu({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const metadata: Metadata = {
  title: "QueryDocs",
  description: "Ask questions grounded in your uploaded documents",
  icons: {
    icon: questionTalk.src,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${font.className} flex min-h-screen flex-col bg-[var(--canvas)] antialiased md:h-screen md:overflow-hidden`}
      >
        <header className="shrink-0">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-7 text-center">
            <h1
              className={`${titleFont.className} text-4xl font-bold tracking-tight text-[#142b48] md:text-5xl`}
            >
              QueryDocs
            </h1>
            <p className="text-sm text-[var(--slate)] md:text-base">
              Search through your documents and get answers grounded in their
              content.
            </p>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 pb-6 md:min-h-0 md:overflow-hidden">
          {children}
        </main>

        <footer className="mx-auto flex w-full max-w-6xl shrink-0 flex-col items-center gap-2 px-6 pb-6 text-center text-xs text-[var(--slate)]">
          <span className="h-px w-16 bg-[var(--soft)]" />
          <p>
            Made by{" "}
            <a
              href="https://github.com/anuja112"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--charcoal)] hover:underline"
            >
              Anuja Ghosal
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
