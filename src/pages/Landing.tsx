import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing: React.FC = () => {
  return (
    <div className="landing">
      <div className="landing-content">
        <h1 className="landing-title">Digital Tarot</h1>
        <p className="landing-subtitle">
          A minimal, ritual-focused tarot reading experience
        </p>
        <p className="landing-description">
          Draw cards, shuffle the deck, and let intuition guide your reading.
          Each shuffle is influenced by your presence and timing.
        </p>
        <Link to="/read" className="landing-button">
          Begin Reading
        </Link>
      </div>
    </div>
  );
};

export default Landing;

