export interface CaptchaResult {
  id: string;
  passed: boolean;
  score?: number;
  attempts: number;
}

export interface AppState {
  completedCaptchas: string[];
  captchaResults: Record<string, CaptchaResult>;
  startTime: number;
}
