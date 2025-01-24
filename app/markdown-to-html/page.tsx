"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy } from "lucide-react";
import { marked } from "marked";
import { useState } from "react";

export default function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState("");
  const [copied, setCopied] = useState(false);

  const htmlContent = marked(markdown);

  const copyHtml = () => {
    if (typeof htmlContent !== "string") return;
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Markdown to HTML Converter</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Markdown</h2>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="h-[500px] font-mono"
            placeholder="Enter your markdown here..."
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Output</h2>
            <button
              onClick={copyHtml}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-secondary hover:bg-secondary/80"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy HTML
                </>
              )}
            </button>
          </div>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="preview" className="flex-1">
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex-1">
                HTML Code
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div
                className="prose prose-slate dark:prose-invert max-w-none p-4 border rounded-md h-[500px] overflow-auto bg-white dark:bg-slate-900"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </TabsContent>
            <TabsContent value="code">
              <Textarea
                value={typeof htmlContent === "string" ? htmlContent : ""}
                readOnly
                className="h-[500px] font-mono"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
