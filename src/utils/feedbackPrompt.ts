// Feedback prompt utility for tracking repeat users and managing prompt eligibility

const STORAGE_KEYS = {
  VISIT_COUNT: 'digital-tarot-visit-count',
  FIRST_SEEN: 'digital-tarot-first-seen',
  FEEDBACK_PROMPT_SHOWN: 'digital-tarot-feedback-prompt-shown',
  READING_COMPLETED: 'digital-tarot-reading-completed',
} as const;

export interface FeedbackPromptState {
  visitCount: number;
  firstSeenTimestamp: number;
  feedbackPromptShown: boolean;
  hasCompletedReading: boolean;
}

/**
 * Initialize visit tracking - call once per session
 */
export const initializeVisitTracking = (): FeedbackPromptState => {
  const visitCount = parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0', 10);
  const firstSeen = localStorage.getItem(STORAGE_KEYS.FIRST_SEEN);
  const feedbackPromptShown = localStorage.getItem(STORAGE_KEYS.FEEDBACK_PROMPT_SHOWN) === 'true';
  const hasCompletedReading = localStorage.getItem(STORAGE_KEYS.READING_COMPLETED) === 'true';

  // Increment visit count for this session
  const newVisitCount = visitCount + 1;
  localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, newVisitCount.toString());

  // Set first seen timestamp if not already set
  if (!firstSeen) {
    localStorage.setItem(STORAGE_KEYS.FIRST_SEEN, Date.now().toString());
  }

  return {
    visitCount: newVisitCount,
    firstSeenTimestamp: firstSeen ? parseInt(firstSeen, 10) : Date.now(),
    feedbackPromptShown,
    hasCompletedReading,
  };
};

/**
 * Mark that user has completed a reading
 */
export const markReadingCompleted = (): void => {
  localStorage.setItem(STORAGE_KEYS.READING_COMPLETED, 'true');
};

/**
 * Mark that feedback prompt has been shown (user clicked "No thanks")
 */
export const markFeedbackPromptShown = (): void => {
  localStorage.setItem(STORAGE_KEYS.FEEDBACK_PROMPT_SHOWN, 'true');
};

/**
 * Check if user is eligible to see the feedback prompt
 * ALL conditions must be true:
 * - visit_count >= 3
 * - User has completed at least one reading
 * - feedback_prompt_shown === false
 * - User is not currently interacting (checked externally)
 */
export const isEligibleForFeedbackPrompt = (
  state: FeedbackPromptState,
  isUserInteracting: boolean
): boolean => {
  if (isUserInteracting) return false;
  if (state.feedbackPromptShown) return false;
  if (state.visitCount < 3) return false;
  if (!state.hasCompletedReading) return false;
  return true;
};

/**
 * Get current feedback prompt state
 */
export const getFeedbackPromptState = (): FeedbackPromptState => {
  const visitCount = parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0', 10);
  const firstSeen = localStorage.getItem(STORAGE_KEYS.FIRST_SEEN) || Date.now().toString();
  const feedbackPromptShown = localStorage.getItem(STORAGE_KEYS.FEEDBACK_PROMPT_SHOWN) === 'true';
  const hasCompletedReading = localStorage.getItem(STORAGE_KEYS.READING_COMPLETED) === 'true';

  return {
    visitCount,
    firstSeenTimestamp: parseInt(firstSeen, 10),
    feedbackPromptShown,
    hasCompletedReading,
  };
};

