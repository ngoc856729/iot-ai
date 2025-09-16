export enum DeviceStatus {
  Normal = 'Normal',
  Warning = 'Warning',
  Critical = 'Critical',
}

export enum ConnectionStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Error = 'Error',
}

export interface DeviceDataPoint {
  time: number;
  temperature: number;
  pressure: number;
  vibration: number;
}

export interface Device {
  id: string;
  name: string;
  protocol: string;
  connectionParams: Record<string, any>;
  status: DeviceStatus;
  connectionStatus: ConnectionStatus;
  currentData: DeviceDataPoint;
  history: DeviceDataPoint[];
}

export interface GeminiAnalysis {
  riskLevel: 'Low' | 'Medium' | 'High';
  prediction: string;
  recommendations: string[];
}

export interface Notification {
  id: number;
  deviceId: string;
  deviceName: string;
  message: string;
  timestamp: string;
  level: 'Warning' | 'Critical';
  isRead: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}


// AI Provider Settings
export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'iotteam';

export interface ProviderSettings {
  apiKey: string;
  model: string;
  baseURL?: string; // Optional, for OpenAI-compatible APIs
}

export interface AISettings {
  provider: AIProvider;
  gemini: ProviderSettings;
  openai: ProviderSettings;
  anthropic: ProviderSettings;
  iotteam: ProviderSettings;
}