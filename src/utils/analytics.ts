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

// Get measurement ID from env var only (no fallback)
const getMeasurementId = (): string | undefined => {
  return import.meta.env.VITE_GA_MEASUREMENT_ID;
};

// Check if GA is available (gtag function exists)
const isGAAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (typeof window.gtag === 'undefined') return false;
  return true;
};

// Track if we've logged warnings/errors (separate for dev vs prod)
let hasLoggedDevWarning = false;
let hasLoggedProdError = false;

// Initialize Google Analytics (dynamically loads script and configures)
// OWNERSHIP: This function owns ALL GA script loading. index.html does NOT load gtag.js.
export const initAnalytics = () => {
  const measurementId = getMeasurementId();
  if (!measurementId) {
    if (import.meta.env.DEV && !hasLoggedDevWarning) {
      console.warn('[Analytics] No GA measurement ID found. Set VITE_GA_MEASUREMENT_ID in .env. GA will not initialize.');
      hasLoggedDevWarning = true;
    } else if (!import.meta.env.DEV && !hasLoggedProdError) {
      console.error('[Analytics] VITE_GA_MEASUREMENT_ID is required in production. GA will not initialize.');
      hasLoggedProdError = true;
    }
    return;
  }

  // Check if gtag.js script is already loaded (prevent double-loading)
  const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
  if (existingScript) {
    // Still proceed to configure if gtag function exists
  } else {
    // Initialize dataLayer and gtag function BEFORE loading script
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());

    // Load gtag.js script dynamically
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }

  // Wait for gtag to be available (script loads async)
  const checkGtag = () => {
    if (typeof window.gtag === 'undefined') {
      // If gtag isn't available yet, wait a bit and try again
      setTimeout(checkGtag, 100);
      return;
    }

    // Enable debug mode in dev or if VITE_GA_DEBUG is set
    const debugMode = import.meta.env.DEV || import.meta.env.VITE_GA_DEBUG === 'true';
    
    // Configure GA with debug mode and disable automatic page_view
    // send_page_view: false prevents double page_view events (we track manually)
    window.gtag('config', measurementId, {
      send_page_view: false,
      ...(debugMode && { debug_mode: true }),
    });
  };

  checkGtag();
};

// Track page views
export const trackPageView = (path: string) => {
  if (!isGAAvailable()) {
    return;
  }

  const measurementId = getMeasurementId();
  if (measurementId) {
    // Use config with send_page_view: false to prevent double page_view
    window.gtag('config', measurementId, {
      page_path: path,
      send_page_view: false,
    });
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
  if (!isGAAvailable()) {
    return;
  }
  
  try {
    window.gtag('event', eventName, eventParams || {});
  } catch (error) {
    // Never throw - silently fail
  }
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
  if (!isGAAvailable()) {
    return;
  }
  
  const key = `ga_tracked_${eventName}`;
  if (sessionStorage.getItem(key)) {
    return; // Already tracked this session
  }
  
  sessionStorage.setItem(key, 'true');
  try {
    window.gtag('event', eventName, eventParams || {});
  } catch (error) {
    // Never throw - silently fail
  }
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
  if (!isGAAvailable()) {
    return;
  }
  
  try {
    window.gtag('event', eventName, eventParams);
  } catch (error) {
    // Never throw - silently fail
  }
};
