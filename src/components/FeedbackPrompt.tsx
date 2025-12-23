import React from 'react';
import { track } from '../utils/analytics';
import { markFeedbackPromptShown } from '../utils/feedbackPrompt';
import './FeedbackPrompt.css';

interface FeedbackPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onShareFeedback: () => void;
  onMaybeLater: () => void;
  onNoThanks: () => void;
}

const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScyhkU7WYG3aaA8wwAO6ltMa3l0oXDuZ0HETMfJR6pjyHeIzg/viewform?usp=header';

export const FeedbackPrompt: React.FC<FeedbackPromptProps> = ({
  isOpen,
  onClose,
  onShareFeedback,
  onMaybeLater,
  onNoThanks,
}) => {
  if (!isOpen) return null;

  const handleShareFeedback = () => {
    track('feedback_prompt_accepted');
    markFeedbackPromptShown();
    window.open(FEEDBACK_FORM_URL, '_blank', 'noopener,noreferrer');
    onShareFeedback();
  };

  const handleMaybeLater = () => {
    track('feedback_prompt_dismissed');
    onMaybeLater();
  };

  const handleNoThanks = () => {
    track('feedback_prompt_declined');
    markFeedbackPromptShown();
    onNoThanks();
  };

  return (
    <div className="feedback-prompt-overlay" onClick={onClose}>
      <div className="feedback-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="feedback-prompt-close"
          onClick={onClose}
          aria-label="Close feedback prompt"
        >
          ×
        </button>
        <h2 className="feedback-prompt-title">Enjoying Digital Tarot?</h2>
        <p className="feedback-prompt-body">
          You've spent some time here, which means a lot.
          <br />
          Digital Tarot is currently in beta, and thoughtful feedback helps shape the official release.
          <br />
          Would you be willing to share a few thoughts?
        </p>
        <div className="feedback-prompt-buttons">
          <button
            className="feedback-prompt-button feedback-prompt-button-primary"
            onClick={handleShareFeedback}
          >
            Share feedback
          </button>
          <button
            className="feedback-prompt-button feedback-prompt-button-secondary"
            onClick={handleMaybeLater}
          >
            Maybe later
          </button>
          <button
            className="feedback-prompt-button feedback-prompt-button-tertiary"
            onClick={handleNoThanks}
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
};

