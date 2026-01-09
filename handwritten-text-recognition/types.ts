
export interface RecognitionResult {
  id: string;
  text: string;
  confidence: number;
  timestamp: number;
  imageUrl: string;
  type: 'upload' | 'canvas';
}

export interface ProcessingState {
  isIdle: boolean;
  isProcessing: boolean;
  error: string | null;
}
