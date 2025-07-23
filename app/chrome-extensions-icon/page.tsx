import { Metadata } from "next";
import { ChromeExtensionsIcon } from "./chrome-extensions-icon";

export const metadata: Metadata = {
  title: "Chrome Extensions Icon Generator",
  description: "Generate all required icon sizes for Chrome extensions from a single 512x512 image",
};

export default function ChromeExtensionsIconPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Chrome Extensions Icon Generator</h1>
      <p className="text-muted-foreground mb-6">
        Upload a 512x512 image and get all required Chrome extension icon sizes (16, 32, 48, 64, 128, 256)
      </p>
      <ChromeExtensionsIcon />
    </div>
  );
}