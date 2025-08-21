'use server';

/**
 * @fileOverview A form data summarization AI agent.
 *
 * - summarizeFormData - A function that handles the form data summarization process.
 * - SummarizeFormDataInput - The input type for the summarizeFormData function.
 * - SummarizeFormDataOutput - The return type for the summarizeFormData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFormDataInputSchema = z.object({
  formData: z.string().describe('The form data to be summarized.'),
});
export type SummarizeFormDataInput = z.infer<typeof SummarizeFormDataInputSchema>;

const SummarizeFormDataOutputSchema = z.object({
  summary: z.string().describe('The summarized form data.'),
  needsUserInput: z.boolean().describe('Whether the summarization requires user input.'),
});
export type SummarizeFormDataOutput = z.infer<typeof SummarizeFormDataOutputSchema>;

export async function summarizeFormData(input: SummarizeFormDataInput): Promise<SummarizeFormDataOutput> {
  return summarizeFormDataFlow(input);
}

const summarizeFormDataPrompt = ai.definePrompt({
  name: 'summarizeFormDataPrompt',
  input: {schema: SummarizeFormDataInputSchema},
  output: {schema: SummarizeFormDataOutputSchema},
  prompt: `You are an expert in summarizing form data for QR code generation.  Your goal is to reduce the length of the provided form data while preserving all essential information.

Form Data: {{{formData}}}

If the summarized data is still too long to fit in a QR code, or if you are unable to create a good summary, set the needsUserInput field to true. If user input is needed, the summary field can be a list of suggested items to remove from the form data to shorten it.
`,
});

const summarizeFormDataFlow = ai.defineFlow(
  {
    name: 'summarizeFormDataFlow',
    inputSchema: SummarizeFormDataInputSchema,
    outputSchema: SummarizeFormDataOutputSchema,
  },
  async input => {
    const {output} = await summarizeFormDataPrompt(input);
    return output!;
  }
);
