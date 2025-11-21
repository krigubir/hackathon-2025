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

export const CAPTCHA_ORDER = [
  'rhythm',
  'counter',
  'identify',
  'golf',
  'stop',
  'emotion',
] as const;

export type CaptchaId = typeof CAPTCHA_ORDER[number];

