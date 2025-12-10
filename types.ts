export interface Note {
  id: string;
  title: string;
  content: string;
  originalTranscript?: string;
  createdAt: number;
  tags: string[];
  style: string;
}

export enum RewriteLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface WritingStyle {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface AppSettings {
  rewriteLevel: RewriteLevel;
  selectedStyleId: string;
  language: string;
}

export interface ProcessingResult {
  title: string;
  content: string;
  tags: string[];
  originalTranscript: string;
}
