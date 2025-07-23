"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Check, Copy, Settings } from "lucide-react";
import { useLocalStorage } from "react-use";
import { toast } from "sonner";

const STORAGE_KEY = "json-formatter-settings";
const JSON_STORAGE_KEY = "json-formatter-input";

interface JsonSettings {
  indentSize: number;
}

const DEFAULT_SETTINGS: JsonSettings = {
  indentSize: 2,
};

function formatJson(
  json: string,
  settings: JsonSettings
): { formatted: string; isValid: boolean } {
  try {
    const parsed = JSON.parse(json);
    return {
      formatted: JSON.stringify(parsed, null, settings.indentSize),
      isValid: true,
    };
  } catch {
    return {
      formatted: json,
      isValid: false,
    };
  }
}

export function JsonFormatter() {
  const [json, setJson] = useLocalStorage(JSON_STORAGE_KEY, "");
  const [copied, copy] = useCopyToClipboard();
  const [settings, setSettings] = useLocalStorage<JsonSettings>(
    STORAGE_KEY,
    DEFAULT_SETTINGS
  );

  const { formatted, isValid } = formatJson(
    json ?? "",
    settings ?? DEFAULT_SETTINGS
  );

  const copyJson = () => {
    copy(formatted);
    toast.success("JSON copied to clipboard");
  };

  const handleSettingsChange = (indentSize: number) => {
    setSettings((prev) => ({
      ...DEFAULT_SETTINGS,
      ...prev,
      indentSize,
    }));
  };

  const handleFormat = () => {
    if (!json?.trim()) {
      toast.error("Please enter some JSON to format");
      return;
    }

    if (!isValid) {
      toast.error("Invalid JSON");
      return;
    }

    setJson(formatted);
    toast.success("JSON formatted successfully");
  };

  const handleClean = () => {
    setJson("");
    setSettings(DEFAULT_SETTINGS);
    toast.success("All data cleared");
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col">
        <div className="h-9 mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">JSON Input</h2>
          <Button onClick={handleClean} variant="destructive">
            Clean All
          </Button>
        </div>
        <Textarea
          value={json}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setJson(e.target.value)
          }
          className="flex-1 min-h-[500px] font-mono resize-none"
          placeholder="Enter your JSON here..."
        />
      </div>
      <div className="flex flex-col">
        <div className="h-9 mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Output</h2>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>JSON Settings</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="indent-size">Indent Size</Label>
                    <Input
                      type="number"
                      id="indent-size"
                      min={1}
                      max={8}
                      value={
                        settings?.indentSize ?? DEFAULT_SETTINGS.indentSize
                      }
                      onChange={(e) =>
                        handleSettingsChange(Number(e.target.value))
                      }
                      className="w-20 px-2 py-1 border rounded"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleFormat}>Format</Button>
            <Button onClick={copyJson} variant="secondary">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy JSON
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-[500px]">
          <div className="p-4 border rounded-md h-full overflow-auto bg-white">
            <pre className="font-mono whitespace-pre-wrap break-all">
              {formatted}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
