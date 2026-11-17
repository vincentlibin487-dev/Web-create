export interface ProjectFile {
  path: string;
  content: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  prompt: string;
  files: ProjectFile[];
  fullCode: string;
  updatedAt: number;
  starred?: boolean;
  publishedSlug?: string;
  publishedAt?: number;
}

export interface PublishedSite {
  siteId: string;
  projectId: string;
  ownerId: string;
  title: string;
  fullCode: string;
  version: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface ConnectedAccount {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  cooldownUntil?: number;
}

export type GeminiModelOption = 'auto' | 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';

export interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  badge: string;
  iconName: string;
  files: ProjectFile[];
  fullCode: string;
}

export interface ActionHistory {
  installedPackages?: string[];
  files: string[];
  built: boolean;
  duration?: string;
  model?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actionHistory?: ActionHistory;
}

export interface RefineResult {
  success: boolean;
  explanation?: string;
  modifiedFiles?: string[];
  usedModel?: string;
  fallbackUsed?: boolean;
  error?: string;
}

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
