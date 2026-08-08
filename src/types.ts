export interface ScriptPreset {
  id: string;
  label: string;
  prompt: string;
  genre: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface TimelineStage {
  step: string;
  title: string;
  description: string;
  timeSaved: string;
  features: string[];
}

export interface ComparisonFeature {
  category: string;
  feature: string;
  traditional: string;
  schrodinger: string;
}
