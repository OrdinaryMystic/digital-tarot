// Google Analytics utility functions with type-safe event tracking

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Type-safe event names
export type AnalyticsEventName =
  | 'session_start'
  | 'instructions_opened'
  | 'shuffle_used'
  | 'draw_card'
  | 'card_moved_first_time'
  | 'card_rotated_first_time'
  | 'card_flipped'
  | 'session_log_opened'
  | 'return_all_cards'
  | 'reset_session'
  | 'error_caught'
  | 'reading_completed'
  | 'feedback_prompt_shown'
  | 'feedback_prompt_accepted'
  | 'feedback_prompt_declined'
  | 'feedback_prompt_dismissed';

// Type-safe event parameters
export interface ShuffleUsedParams {
  mode: 'riffle' | 'overhand' | 'split' | 'spin' | 'randomize';
}

export interface DrawCardParams {
  face_up: boolean;
  deck_mode: 'normal' | 'split';
  source_pile: 'main' | 'left' | 'right';
}

export interface CardFlippedParams {
  to_face_up: boolean;
}

export interface ErrorCaughtParams {
  context: string;
  message: string;
}

type EventParams =
  | ShuffleUsedParams
  | DrawCardParams
  | CardFlippedParams
  | ErrorCaughtParams
  | Record<string, never>; // For events with no params

// Check if GA is available and measurement ID exists
const isGAAvailable = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof window.gtag !== 'undefined' &&
    !!import.meta.env.VITE_GA_MEASUREMENT_ID
  );
};

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
};

// Track page views
export const trackPageView = (path: string) => {
  if (isGAAvailable()) {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId) {
      window.gtag('config', measurementId, {
        page_path: path,
      });
    }
  }
};

// Track custom events (type-safe)
export const track = <T extends AnalyticsEventName>(
  eventName: T,
  eventParams?: T extends 'shuffle_used'
    ? ShuffleUsedParams
    : T extends 'draw_card'
    ? DrawCardParams
    : T extends 'card_flipped'
    ? CardFlippedParams
    : T extends 'error_caught'
    ? ErrorCaughtParams
    : Record<string, never>
) => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', eventName, eventParams || {});
};

// Track events once per session (using sessionStorage)
export const trackOnce = <T extends AnalyticsEventName>(
  eventName: T,
  eventParams?: T extends 'shuffle_used'
    ? ShuffleUsedParams
    : T extends 'draw_card'
    ? DrawCardParams
    : T extends 'card_flipped'
    ? CardFlippedParams
    : T extends 'error_caught'
    ? ErrorCaughtParams
    : Record<string, never>
) => {
  if (!isGAAvailable()) return;
  
  const key = `ga_tracked_${eventName}`;
  if (sessionStorage.getItem(key)) {
    return; // Already tracked this session
  }
  
  sessionStorage.setItem(key, 'true');
  window.gtag('event', eventName, eventParams || {});
};

// Reading completion tracking state
let readingCompletionState = {
  hasShuffled: false,
  drawCount: 0,
  hasMovedCard: false,
  hasOpenedLog: false,
  completed: false,
};

// Check and fire reading_completed event if conditions are met
export const checkReadingCompletion = () => {
  if (readingCompletionState.completed) return;
  
  const { hasShuffled, drawCount, hasMovedCard, hasOpenedLog } = readingCompletionState;
  
  if (
    hasShuffled &&
    drawCount >= 3 &&
    (hasMovedCard || hasOpenedLog)
  ) {
    readingCompletionState.completed = true;
    track('reading_completed');
    // Mark reading as completed in localStorage for feedback prompt
    if (typeof window !== 'undefined') {
      localStorage.setItem('digital-tarot-reading-completed', 'true');
    }
  }
};

// Update reading completion state
export const updateReadingState = (
  updates: Partial<typeof readingCompletionState> | ((prev: typeof readingCompletionState) => Partial<typeof readingCompletionState>)
) => {
  if (typeof updates === 'function') {
    readingCompletionState = { ...readingCompletionState, ...updates(readingCompletionState) };
  } else {
    readingCompletionState = { ...readingCompletionState, ...updates };
  }
  checkReadingCompletion();
};

// Reset reading completion state (for new sessions)
export const resetReadingState = () => {
  readingCompletionState = {
    hasShuffled: false,
    drawCount: 0,
    hasMovedCard: false,
    hasOpenedLog: false,
    completed: false,
  };
};

// Legacy function for backward compatibility
export const trackEvent = (
  eventName: string,
  eventParams?: {
    [key: string]: any;
  }
) => {
  if (!isGAAvailable()) return;
  window.gtag('event', eventName, eventParams);
};
