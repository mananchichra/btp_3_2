import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, CornerRightDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { FeedbackResponse } from "@shared/schema";

// Form validation schema
const feedbackFormSchema = z.object({
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
  model: z.string().min(1, "Please select an AI model"),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface AdrFeedbackProps {
  adrId: number;
  onRefinementReceived: (refinedAdr: FeedbackResponse) => void;
}

export function AdrFeedback({ adrId, onRefinementReceived }: AdrFeedbackProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      feedback: "",
      model: "gpt-4o",
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest(
        "POST", 
        `/api/adrs/${adrId}/feedback`, 
        { feedback: data.feedback, model: data.model }
      );
      
      const result = await response.json();
      
      onRefinementReceived(result);
      
      toast({
        title: "Feedback Submitted",
        description: "Your ADR has been refined based on your feedback.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Failed to process feedback:", error);
      toast({
        title: "Error Processing Feedback",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Badge variant="outline" className="mr-2">Feedback</Badge>
          Refine this ADR
        </CardTitle>
        <CardDescription>
          Provide feedback to improve this ADR and generate a refined version
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What could be improved in this ADR? Specify any issues, missing information, or suggestions for improvement..."
                      className="resize-none h-32"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem className="w-full md:w-64">
                  <FormLabel>AI Model for Refinement</FormLabel>
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
                      <SelectItem value="claude-3-7-sonnet-20250219">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => form.reset()}
          disabled={isSubmitting}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CornerRightDown className="mr-2 h-4 w-4" />
              Submit Feedback
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}