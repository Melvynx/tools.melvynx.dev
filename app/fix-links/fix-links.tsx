"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useLocalStorage } from "react-use";
import { toast } from "sonner";

const STORAGE_KEY = "fix-links-input";

function fixLink(input: string): string {
  return input
    .split("\n")
    .map((line) => line.trim())
    .join("");
}

export function FixLinks() {
  const [input, setInput] = useLocalStorage(STORAGE_KEY, "");
  const [copied, copy] = useCopyToClipboard();
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const fixed = fixLink(input ?? "");

  const handleCopy = () => {
    copy(fixed);
    toast.success("Link copied to clipboard");
  };

  const handleOpen = () => {
    const trimmed = fixed.trim();
    if (!trimmed) {
      toast.error("No link to open");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      toast.error("Only http/https links are supported");
      return;
    }
    window.open(trimmed, "_blank");
  };

  const handleOutputClick = () => {
    outputRef.current?.select();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col">
          <div className="h-9 mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Broken Link</h2>
            <Button
              onClick={() => {
                setInput("");
                toast.success("Cleared");
              }}
              variant="destructive"
              size="sm"
            >
              Clear
            </Button>
          </div>
          <Textarea
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            className="min-h-[200px] font-mono resize-none"
            placeholder="Paste your broken link here..."
          />
        </div>

        <div className="flex flex-col">
          <div className="h-9 mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fixed Link</h2>
            <div className="flex items-center gap-2">
              <Button onClick={handleCopy} variant="secondary" size="sm">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button onClick={handleOpen} size="sm">
                <ExternalLink className="h-4 w-4" />
                Open
              </Button>
            </div>
          </div>
          <Textarea
            ref={outputRef}
            value={fixed}
            readOnly
            onClick={handleOutputClick}
            className="min-h-[100px] font-mono resize-none cursor-pointer"
            placeholder="Fixed link will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
