import { Button } from "@/components/ui/button";
import { Clipboard, Check, Download, History } from "lucide-react";
import { useState, useEffect } from "react";
import { type GenerateAdrResponse, type FeedbackResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { marked } from "marked";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AdrFeedback } from "@/components/AdrFeedback";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiRequest } from "@/lib/queryClient";

interface AdrResultProps {
  result: GenerateAdrResponse & { id?: number };
}

export function AdrResult({ result }: AdrResultProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [currentAdr, setCurrentAdr] = useState(result);
  const [refinements, setRefinements] = useState<FeedbackResponse[]>([]);
  const [showRefinements, setShowRefinements] = useState(false);
  const [loadingRefinements, setLoadingRefinements] = useState(false);
  
  // Parse the markdown content
  const htmlContent = marked.parse(currentAdr.content);
  
  // Load refinements if there's an ID (we're looking at a saved ADR)
  useEffect(() => {
    if (result.id) {
      loadRefinements(result.id);
    }
  }, [result.id]);
  
  const loadRefinements = async (adrId: number) => {
    try {
      setLoadingRefinements(true);
      
      const response = await apiRequest("GET", `/api/adrs/${adrId}/refinements`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setRefinements(data.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          originalAdrId: item.originalAdrId || adrId
        })));
      }
    } catch (error) {
      console.error("Failed to load refinements:", error);
      toast({
        title: "Error Loading Refinements",
        description: "Could not load the refinement history for this ADR.",
        variant: "destructive"
      });
    } finally {
      setLoadingRefinements(false);
    }
  };
  
  const handleRefinementReceived = (refinedAdr: FeedbackResponse) => {
    // Add to refinements list
    setRefinements(prev => [refinedAdr, ...prev]);
    
    // Update the current ADR to show the refined version
    setCurrentAdr({
      id: refinedAdr.id,
      title: refinedAdr.title,
      content: refinedAdr.content
    });
    
    // Open the refinements accordion
    setShowRefinements(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentAdr.content);
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
  
  const handleDownload = () => {
    const blob = new Blob([currentAdr.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentAdr.title.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "ADR Downloaded",
      description: "The ADR has been downloaded as a Markdown file",
    });
  };
  
  // View a previous refinement
  const viewRefinement = (refinedAdr: FeedbackResponse) => {
    setCurrentAdr({
      id: refinedAdr.id, 
      title: refinedAdr.title, 
      content: refinedAdr.content
    });
  };

  const renderedHtml = marked.parse(result.content);

  return (
    <div className="w-full mt-6 space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">{currentAdr.title}</CardTitle>
          {refinements.length > 0 && (
            <CardDescription>
              This is revision {refinements.length + 1} of the ADR
            </CardDescription>
          )}
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="h-8 gap-1"
            >
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8 gap-1"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview">
            <TabsList className="mb-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </TabsContent>
            <TabsContent value="markdown">
              <Textarea
                className="font-mono text-sm h-[50vh] resize-none"
                value={currentAdr.content}
                readOnly
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Only show feedback form for ADRs with an ID (saved ADRs) */}
      {result.id && (
        <AdrFeedback 
          adrId={result.id} 
          onRefinementReceived={handleRefinementReceived} 
        />
      )}
      
      {/* Show refinement history if any exist */}
      {refinements.length > 0 && (
        <Card>
          <Accordion
            type="single"
            collapsible
            value={showRefinements ? "refinements" : undefined}
            onValueChange={(value) => setShowRefinements(value === "refinements")}
          >
            <AccordionItem value="refinements">
              <CardHeader className="px-6 py-0">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    <h3 className="text-lg font-medium">
                      Refinement History ({refinements.length})
                    </h3>
                  </div>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    {refinements.map((refinement, index) => (
                      <div key={refinement.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">
                            Version {refinements.length - index + 1}: {refinement.title}
                          </h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => viewRefinement(refinement)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      )}
      <div className="border rounded-md p-6 bg-white overflow-auto prose prose-slate max-w-none">
        <div dangerouslySetInnerHTML={{ __html: renderedHtml }}></div>
      </div>
    </div>
  );
}
