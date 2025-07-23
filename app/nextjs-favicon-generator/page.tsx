import { Metadata } from "next";
import { NextjsFaviconGenerator } from "./nextjs-favicon-generator";

export const metadata: Metadata = {
  title: "Next.js Favicon Generator",
  description: "Generate all required favicon formats for Next.js: icon.png, favicon.ico, and apple-icon.png",
};

export default function NextjsFaviconGeneratorPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Next.js Favicon Generator</h1>
      <p className="text-muted-foreground mb-6">
        Upload any image and get all 3 required favicon formats for Next.js: icon.png (512x512), favicon.ico (48x48), and apple-icon.png (180x180)
      </p>
      <NextjsFaviconGenerator />
    </div>
  );
}