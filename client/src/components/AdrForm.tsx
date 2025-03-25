import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateAdrSchema, type GenerateAdrResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Wand2, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AVAILABLE_TEMPLATES } from "@/lib/adr-template";

interface AdrFormProps {
  onResult: (data: GenerateAdrResponse) => void;
}

export function AdrForm({ onResult }: AdrFormProps) {
  const { toast } = useToast();
  const [charCount, setCharCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplateDescription, setSelectedTemplateDescription] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(generateAdrSchema),
    defaultValues: {
      prompt: "",
      model: "gpt-4o",
      templateId: "standard"
    }
  });

  const watchPrompt = form.watch("prompt");
  const watchTemplateId = form.watch("templateId");

  useEffect(() => {
    setCharCount(watchPrompt.length);
  }, [watchPrompt]);

  useEffect(() => {
    const template = AVAILABLE_TEMPLATES.find(t => t.id === watchTemplateId);
    setSelectedTemplateDescription(template?.description || null);
  }, [watchTemplateId]);

  const handleClearForm = () => {
    form.reset();
    setCharCount(0);
  };

  const onSubmit = async (data: { prompt: string; model: string; templateId: string }) => {
    try {
      setIsGenerating(true);
      const response = await apiRequest("POST", "/api/adrs/generate", data);
      const result = await response.json();
      onResult(result);
    } catch (error) {
      console.error("Failed to generate ADR:", error);
      toast({
        title: "Error generating ADR",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-neutral-700">
                Architecture Context/Prompt
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Describe the architectural context, problem, or decision you need help with..."
                    className="resize-none"
                    rows={8}
                    {...field}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-neutral-500">
                    <span>{charCount}</span> characters
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-700">
                  AI Model
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-1">
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    ADR Template
                  </FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Info className="h-4 w-4 text-neutral-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>Choose a template format for your ADR. Each template has a different structure and emphasis.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AVAILABLE_TEMPLATES.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplateDescription && (
                  <FormDescription className="text-xs mt-1">
                    {selectedTemplateDescription}
                  </FormDescription>
                )}
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearForm}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear
          </Button>
          
          <Button 
            type="submit"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate ADR
              </>
            )}
          </Button>
        </div>
      </form>

      {isGenerating && (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-neutral-600">Generating your ADR...</p>
        </div>
      )}
    </Form>
  );
}
