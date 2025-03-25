import { Button } from "@/components/ui/button";
import { Clipboard, Check } from "lucide-react";
import { useState } from "react";
import { type GenerateAdrResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AdrResultProps {
  result: GenerateAdrResponse;
}

export function AdrResult({ result }: AdrResultProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      
      toast({
        title: "Copied to clipboard",
        description: "The ADR has been copied to your clipboard",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Generated Architectural Decision Record</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleCopyToClipboard}
        >
          {copied ? (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Clipboard className="mr-1.5 h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      <div className="border rounded-md p-6 bg-white overflow-auto prose prose-slate max-w-none">
        <div dangerouslySetInnerHTML={{ __html: result.content }}></div>
      </div>
    </div>
  );
}
