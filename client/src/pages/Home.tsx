import { AdrForm } from "@/components/AdrForm";
import { AdrResult } from "@/components/AdrResult";
import { useState } from "react";
import { type GenerateAdrResponse, type FeedbackResponse } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [result, setResult] = useState<(GenerateAdrResponse & { id?: number }) | null>(null);
  
  const handleResult = (data: GenerateAdrResponse & { id?: number }) => {
    setResult(data);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">Architectural Decision Record Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <AdrForm onResult={handleResult} />
          {result && <AdrResult result={result} />}
        </CardContent>
      </Card>
    </main>
  );
}
