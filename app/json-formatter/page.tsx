import { Metadata } from "next";
import { JsonFormatter } from "./json-formatter";

export const metadata: Metadata = {
  title: "JSON Formatter",
  description: "Simple to use tools to format and validate JSON",
};

export default function JsonFormatterPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">JSON Formatter</h1>
      <JsonFormatter />
    </div>
  );
}
