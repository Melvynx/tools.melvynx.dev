import { Metadata } from "next";
import { RandomNumber } from "./random-number";

export const metadata: Metadata = {
  title: "Random Number Generator",
  description: "Generate random numbers with customizable range and count",
};

export default function RandomNumberPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Random Number Generator</h1>
      <RandomNumber />
    </div>
  );
}
