import { Metadata } from "next";
import { MarkdownConverter } from "./MarkdownConverter";

export const metadata: Metadata = {
  title: "Markdown to HTML Converter",
  description: "Simple to use tools to convert Markdown to HTML",
};

export default function MarkdownToHtml() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Markdown to HTML Converter</h1>
      <MarkdownConverter />
    </div>
  );
}
