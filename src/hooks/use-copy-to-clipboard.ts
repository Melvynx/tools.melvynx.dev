import { useState } from "react";

export const useCopyToClipboard = (
  timeout = 2000
): [boolean, (str: string) => void] => {
  const [copied, setCopied] = useState(false);

  const copy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
  };

  return [copied, copy];
};
