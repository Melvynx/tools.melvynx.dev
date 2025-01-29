"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Settings } from "lucide-react";
import { marked } from "marked";
import { useState } from "react";
import { useLocalStorage } from "react-use";

const STORAGE_KEY = "markdown-converter-settings";

interface MarkdownSettings {
  escapeHtml: boolean;
}

const DEFAULT_SETTINGS: MarkdownSettings = {
  escapeHtml: true,
};

function processMarkdown(markdown: string, settings: MarkdownSettings): string {
  const htmlContent = marked(markdown, {
    gfm: true,
    breaks: true,
  });

  if (typeof htmlContent !== "string") return "";

  return settings.escapeHtml
    ? htmlContent
    : htmlContent.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}

export function MarkdownConverter() {
  const [markdown, setMarkdown] = useState("");
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useLocalStorage<MarkdownSettings>(
    STORAGE_KEY,
    DEFAULT_SETTINGS
  );

  const processedHtml = processMarkdown(markdown, settings ?? DEFAULT_SETTINGS);

  const copyHtml = () => {
    navigator.clipboard.writeText(processedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSettingsChange = (escapeHtml: boolean) => {
    setSettings((prev) => ({
      ...prev,
      escapeHtml,
    }));
  };

  return (
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
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md hover:bg-secondary/80">
                  <Settings className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Markdown Settings</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="escape-html">Escape HTML Entities</Label>
                    <Switch
                      id="escape-html"
                      checked={
                        settings?.escapeHtml ?? DEFAULT_SETTINGS.escapeHtml
                      }
                      onCheckedChange={handleSettingsChange}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Convert apostrophes to HTML entities (e.g.,
                    &apos;n&apos;as&apos; → &apos;n&#39;as&apos;)
                  </p>
                </div>
              </DialogContent>
            </Dialog>
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
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
          </TabsContent>
          <TabsContent value="code">
            <Textarea
              value={processedHtml}
              readOnly
              className="h-[500px] font-mono"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
