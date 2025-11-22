import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { AppState } from "../types";

interface AppContextType {
  state: AppState;
  markCaptchaComplete: (id: string, passed: boolean, score?: number) => void;
  incrementAttempts: (id: string) => void;
  resetProgress: () => void;
  getCurrentCaptchaIndex: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "dystopian-captcha-state";
const isBrowser = typeof window !== "undefined";

const defaultState: AppState = {
  completedCaptchas: [],
  captchaResults: {},
  startTime: Date.now(),
};

const getStoredState = (): AppState => {
  if (!isBrowser) return defaultState;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultState;
    }
  }
  return defaultState;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(() => getStoredState());

  useEffect(() => {
    if (!isBrowser) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const markCaptchaComplete = (id: string, passed: boolean, score?: number) => {
    setState((prev) => {
      const newCompleted =
        passed && !prev.completedCaptchas.includes(id)
          ? [...prev.completedCaptchas, id]
          : prev.completedCaptchas;

      const existingResult = prev.captchaResults[id];
      const attempts = existingResult ? existingResult.attempts : 1;

      return {
        ...prev,
        completedCaptchas: newCompleted,
        captchaResults: {
          ...prev.captchaResults,
          [id]: {
            id,
            passed,
            score,
            attempts,
          },
        },
      };
    });
  };

  const incrementAttempts = (id: string) => {
    setState((prev) => {
      const existingResult = prev.captchaResults[id];
      return {
        ...prev,
        captchaResults: {
          ...prev.captchaResults,
          [id]: {
            id,
            passed: false,
            attempts: existingResult ? existingResult.attempts + 1 : 1,
          },
        },
      };
    });
  };

  const resetProgress = () => {
    setState({ ...defaultState, startTime: Date.now() });
    if (isBrowser) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const getCurrentCaptchaIndex = () => {
    return state.completedCaptchas.length;
  };

  return (
    <AppContext.Provider
      value={{
        state,
        markCaptchaComplete,
        incrementAttempts,
        resetProgress,
        getCurrentCaptchaIndex,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
