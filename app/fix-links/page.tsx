import { Metadata } from "next";
import { FixLinks } from "./fix-links";

export const metadata: Metadata = {
  title: "Fix Links",
  description:
    "Fix broken links copied from terminal - remove line breaks and whitespace",
};

export default function FixLinksPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Fix Links</h1>
      <FixLinks />
    </div>
  );
}
