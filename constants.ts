import { WritingStyle, RewriteLevel } from './types';

export const WRITING_STYLES: WritingStyle[] = [
  {
    id: 'simple',
    name: 'Simple & Clear',
    description: 'Friendly, simple sentences. Easy to read.',
    systemPrompt: 'Rewrite the text to be simple, clear, and friendly. Use short sentences and everyday vocabulary.'
  },
  {
    id: 'bullets',
    name: 'Book Notes',
    description: 'Short paragraphs, bullet points, structured.',
    systemPrompt: 'Summarize the text into structured bullet points and short paragraphs. Focus on key takeaways.'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal tone, perfect grammar, email-ready.',
    systemPrompt: 'Rewrite the text to sound professional, polished, and suitable for business communication. Fix all grammar.'
  },
  {
    id: 'poetic',
    name: 'Creative',
    description: 'Evocative language, more descriptive.',
    systemPrompt: 'Rewrite the text with a creative flair. Use evocative language and descriptive imagery.'
  }
];

export const DEFAULT_SETTINGS = {
  rewriteLevel: RewriteLevel.MEDIUM,
  selectedStyleId: 'simple',
  language: 'English',
};
