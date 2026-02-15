export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  model?: string;
  messages: AIMessage[];
}

export interface AIResponse {
  response: string;
}