import React from 'react';
import './Instructions.css';

interface InstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="instructions-overlay" onClick={onClose}>
      <div className="instructions-panel" onClick={(e) => e.stopPropagation()}>
        <div className="instructions-header">
          <h1>Welcome to Digital Tarot</h1>
          <button className="instructions-close" onClick={onClose} aria-label="Close instructions">
            ×
          </button>
        </div>
        
        <div className="instructions-content">
          <section>
            <h2>Getting Started</h2>
            <p>
              To get started, click the deck to draw a card. At first, all cards are in deck order. 
              To shuffle, use the shuffle controls in the toolbar.
            </p>
          </section>

          <section>
            <h2>Shuffle Modes</h2>
            <div className="instruction-item">
              <strong>🔀 Riffle Shuffle:</strong> Splits the deck in half and interlaces the cards together, 
              creating a realistic shuffle pattern. Click once to perform a single riffle shuffle.
            </div>
            <div className="instruction-item">
              <strong>▶ Overhand Shuffle:</strong> Takes chunks of cards from the top and redistributes them 
              throughout the deck. Click to start continuous shuffling, then click again to stop when you feel 
              the moment is right.
            </div>
            <div className="instruction-item">
              <strong>✂️ Cut Deck:</strong> Splits the deck into two halves that you can position separately. 
              Use the rejoin button to combine them back together, or use a shuffle mode which will automatically 
              rejoin and shuffle the decks. The order in which you rejoin affects which cards end up on top.
            </div>
            <div className="instruction-item">
              <strong>🌀 Spin Deck:</strong> Randomly reverses cards while keeping their order. This is perfect 
              for mixing upright and reversed cards without changing the sequence.
            </div>
          </section>

          <section>
            <h2>The Mystical Shuffle Algorithm</h2>
            <p>
              The shuffle algorithm is influenced by your behavior on the page. Every movement of your mouse, 
              every click, and the timing of your actions contribute to the seed that determines how the cards 
              are shuffled. This means you can move your mouse around the screen while shuffling to affect the 
              outcome. Use this to follow your intuition—stop the shuffling when you feel the moment is right, 
              and let your natural movements guide the cards.
            </p>
          </section>

          <section>
            <h2>Drawing Cards</h2>
            <div className="instruction-item">
              <strong>👁️ Draw Face Up / 🙈 Draw Face Down:</strong> Toggle whether cards are drawn face up 
              or face down. When face down, you can double-click a card to flip it over.
            </div>
            <p>
              You can drag cards around the table to position them. Drag a card onto the deck to return it 
              to the bottom of the deck.
            </p>
          </section>

          <section>
            <h2>Session Log</h2>
            <p>
              Click the clipboard icon (📋) to view your current session. The session log shows all cards 
              you've drawn, along with statistics including the number of major arcana, cards from each suit, 
              and upright vs reversed cards.
            </p>
          </section>

          <section>
            <h2>Return All Cards</h2>
            <p>
              Click "Return All Cards" (↩️) to return all drawn cards back to the deck. This maintains your 
              current session statistics, so you can continue tracking your reading. Cards are added to the 
              bottom of the deck, so you may want to shuffle again after returning cards.
            </p>
          </section>

          <section>
            <h2>Reset Session</h2>
            <p>
              Click "Reset Session" (🔄) to restore the deck to its original order, erase your current session 
              statistics, and start from scratch. This is useful when you want to begin a completely new reading.
            </p>
          </section>

          <section>
            <h2>Tips</h2>
            <ul>
              <li>You can zoom in and out using the zoom controls</li>
              <li>Click and drag on empty space to pan around the table</li>
              <li>Double-click any card to rotate it</li>
            </ul>
          </section>

          <section className="instructions-footer">
            <p>
              Created by <a href="https://ordinarymysticreadings.com" target="_blank" rel="noopener noreferrer"><strong>Ordinary Mystic</strong></a>. Follow on{' '}
              <a href="https://www.tiktok.com/@ordinarymysticreadings" target="_blank" rel="noopener noreferrer">TikTok</a>.
            </p>
            <p>
              Suggestions for making this tool better?{' '}
              <a href="mailto:ordinarymysticreadings@gmail.com">Email me</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Instructions;

