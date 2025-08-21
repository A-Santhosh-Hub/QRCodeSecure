'use server';

import { summarizeFormData } from '@/ai/flows/summarize-form-data';

export async function getSummary(formData: string) {
  try {
    const result = await summarizeFormData({ formData });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in AI summarization:', error);
    return { success: false, error: 'Failed to summarize data.' };
  }
}
