export interface VoiceLog {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  actionExecuted?: string;
}

export interface LiveKitState {
  isConnected: boolean;
  isConnecting: boolean;
  roomName: string;
  identity: string;
  participantCount: number;
  serverUrl: string;
  audioLevel: number;
  error: string | null;
}

export interface AndroidPhoneState {
  wifi: boolean;
  bluetooth: boolean;
  flashlight: boolean;
  volume: number; // 0 - 100
  batteryLevel: number | null;
  batteryCharging: boolean;
  activeApp: string | null;
  lastAction: string | null;
  isFlashlightSupported: boolean;
}

export interface McpRelayConfig {
  url: string;
  token: string;
  isConnected: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastResponse: string | null;
  tools: string[];
}

export interface DriveSavedFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  webViewLink?: string;
  size?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
  updated: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated: string;
}
