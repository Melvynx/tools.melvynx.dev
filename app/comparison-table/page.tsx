import { Metadata } from "next";
import { ComparisonTable } from "./comparison-table";

export const metadata: Metadata = {
  title: "Comparison Table",
  description: "Create customizable comparison tables with ratings and localStorage persistence",
};

export default function ComparisonTablePage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Comparison Table</h1>
      <p className="text-muted-foreground mb-6">
        Create and customize comparison tables. Add columns and rows, rate features, and your data will be saved automatically.
      </p>
      <ComparisonTable />
    </div>
  );
}
