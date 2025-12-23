import { useState, useEffect, useRef, useCallback } from 'react';
import {
  initializeVisitTracking,
  markReadingCompleted,
  isEligibleForFeedbackPrompt,
  getFeedbackPromptState,
  FeedbackPromptState,
} from '../utils/feedbackPrompt';
import { track } from '../utils/analytics';

interface UseFeedbackPromptProps {
  isDragging: boolean;
  isRotating: boolean;
  isShuffling: boolean;
  showInstructions: boolean;
  hasCompletedReading: boolean; // Passed from reading completion tracking
}

export const useFeedbackPrompt = ({
  isDragging,
  isRotating,
  isShuffling,
  showInstructions,
  hasCompletedReading,
}: UseFeedbackPromptProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptState, setPromptState] = useState<FeedbackPromptState | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const hasShownThisSessionRef = useRef(false);
  const readingCompletedRef = useRef(false);

  // Initialize visit tracking on mount
  useEffect(() => {
    const state = initializeVisitTracking();
    setPromptState(state);
    
    // Mark reading as completed if it was completed in this session
    if (hasCompletedReading && !readingCompletedRef.current) {
      readingCompletedRef.current = true;
      markReadingCompleted();
      // Update state to reflect reading completion
      const updatedState = getFeedbackPromptState();
      updatedState.hasCompletedReading = true;
      setPromptState(updatedState);
    }
  }, [hasCompletedReading]);

  // Check if user is currently interacting
  const isUserInteracting = isDragging || isRotating || isShuffling || showInstructions;

  // Reset idle timer when user interacts
  useEffect(() => {
    if (isUserInteracting) {
      lastInteractionRef.current = Date.now();
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    }
  }, [isUserInteracting]);

  // Check eligibility and show prompt during idle moments
  useEffect(() => {
    if (hasShownThisSessionRef.current) return;
    if (!promptState) return;
    if (showPrompt) return; // Already showing

    const checkAndShowPrompt = () => {
      if (isUserInteracting) return;
      if (!isEligibleForFeedbackPrompt(promptState, isUserInteracting)) return;

      // Update state to get latest reading completion status
      const currentState = getFeedbackPromptState();
      if (!isEligibleForFeedbackPrompt(currentState, isUserInteracting)) return;

      setShowPrompt(true);
      hasShownThisSessionRef.current = true;
      track('feedback_prompt_shown');
    };

    // Check after idle period (5-10 seconds)
    if (!isUserInteracting) {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      const idleDelay = Math.random() * 5000 + 5000; // 5-10 seconds

      if (timeSinceLastInteraction >= idleDelay) {
        checkAndShowPrompt();
      } else {
        // Set timer for remaining idle time
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
        }
        idleTimerRef.current = setTimeout(() => {
          checkAndShowPrompt();
        }, idleDelay - timeSinceLastInteraction);
      }
    }

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [promptState, isUserInteracting, showPrompt]);

  // Show prompt immediately after reading completion (if eligible)
  useEffect(() => {
    if (hasShownThisSessionRef.current) return;
    if (!promptState) return;
    if (showPrompt) return;
    if (!hasCompletedReading) return;
    if (isUserInteracting) return;

    // Small delay to let reading completion settle
    const timer = setTimeout(() => {
      const currentState = getFeedbackPromptState();
      currentState.hasCompletedReading = true;
      
      if (isEligibleForFeedbackPrompt(currentState, isUserInteracting)) {
        setShowPrompt(true);
        hasShownThisSessionRef.current = true;
        track('feedback_prompt_shown');
      }
    }, 2000); // 2 second delay after reading completion

    return () => clearTimeout(timer);
  }, [hasCompletedReading, promptState, isUserInteracting, showPrompt]);

  const handleClose = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const handleShareFeedback = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const handleMaybeLater = useCallback(() => {
    setShowPrompt(false);
    // Allow re-show after 1 more visit (don't mark as shown)
  }, []);

  const handleNoThanks = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return {
    showPrompt,
    handleClose,
    handleShareFeedback,
    handleMaybeLater,
    handleNoThanks,
  };
};

