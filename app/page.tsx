import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container flex flex-col gap-4 lg:gap-12">
      <h1 className="text-4xl font-bold">tools.melvynx.dev</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Link href="/markdown-to-html">
          <Card>
            <CardHeader>
              <CardTitle>Markdown to HTML</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Convert Markdown to HTML</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
