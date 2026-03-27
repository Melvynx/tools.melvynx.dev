"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { ArrowLeft, Check, Copy, Dices } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

function generateRandomNumbers(
  min: number,
  max: number,
  count: number,
  unique: boolean,
  decimals: boolean
): number[] {
  if (unique && !decimals && count > max - min + 1) {
    toast.error("Cannot generate that many unique integers in this range");
    return [];
  }

  const results: number[] = [];
  const seen = new Set<number>();

  while (results.length < count) {
    let value: number;
    if (decimals) {
      value = Math.random() * (max - min) + min;
      value = Math.round(value * 100) / 100;
    } else {
      value = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    if (unique && seen.has(value)) continue;

    seen.add(value);
    results.push(value);
  }

  return results;
}

export function RandomNumber() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(false);
  const [decimals, setDecimals] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [copied, copy] = useCopyToClipboard();

  const handleGenerate = () => {
    if (min > max) {
      toast.error("Min must be less than or equal to Max");
      return;
    }
    if (count < 1 || count > 1000) {
      toast.error("Count must be between 1 and 1000");
      return;
    }
    const nums = generateRandomNumbers(min, max, count, unique, decimals);
    if (nums.length > 0) {
      setResults(nums);
    }
  };

  const handleCopy = () => {
    copy(results.join(", "));
    toast.success("Copied to clipboard");
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="min">Min</Label>
          <Input
            id="min"
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max">Max</Label>
          <Input
            id="max"
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="count">Count</Label>
          <Input
            id="count"
            type="number"
            value={count}
            min={1}
            max={1000}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch id="unique" checked={unique} onCheckedChange={setUnique} />
          <Label htmlFor="unique">Unique only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="decimals"
            checked={decimals}
            onCheckedChange={setDecimals}
          />
          <Label htmlFor="decimals">Decimals</Label>
        </div>
      </div>

      <Button onClick={handleGenerate} className="w-full" size="lg">
        <Dices className="h-5 w-5 mr-2" />
        Generate
      </Button>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Result{results.length > 1 ? "s" : ""}
            </h2>
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
          </div>
          <div className="flex flex-wrap gap-2">
            {results.map((num, i) => (
              <div
                key={i}
                className="rounded-md border bg-muted px-3 py-2 font-mono text-lg"
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
