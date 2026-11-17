export interface Project {
  id: string;
  title: string;
  description: string;
  prompt: string;
  html: string;
  css: string;
  js: string;
  fullCode: string;
  updatedAt: number;
  starred?: boolean;
}

export interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  badge: string;
  iconName: string;
  html: string;
  css: string;
  js: string;
  fullCode: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type ActiveTab = 'preview' | 'html' | 'css' | 'js' | 'chat';
