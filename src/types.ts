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
  createdAt?: unknown;
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

export interface VideoGenParams {
  prompt: string;
  duration: string;
  aspectRatio: string;
  style: string;
}

export interface MusicGenParams {
  genre: string;
  mood: string;
  duration: string;
  instruments: string[];
  prompt: string;
}

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    description: string;
  };
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    precipitation: number;
  }>;
  alerts: Array<{
    event: string;
    severity: string;
    description: string;
  }>;
}

export interface ConversionJob {
  id: string;
  url: string;
  title: string;
  duration: string;
  bitrate: string;
  status: "queued" | "processing" | "completed" | "error";
  error?: string;
  downloadUrl?: string;
}
