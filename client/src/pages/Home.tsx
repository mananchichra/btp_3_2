import { AdrForm } from "@/components/AdrForm";
import { AdrResult } from "@/components/AdrResult";
import { useState } from "react";
import { type GenerateAdrResponse } from "@shared/schema";

export default function Home() {
  const [result, setResult] = useState<GenerateAdrResponse | null>(null);
  
  const handleResult = (data: GenerateAdrResponse) => {
    setResult(data);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Generate Architectural Decision Record</h2>
          <AdrForm onResult={handleResult} />
          {result && <AdrResult result={result} />}
        </div>
      </div>
    </main>
  );
}
