import React from "react";
import './styles/TopInfoBar.css';

const TopInfoBar: React.FC = () => {


  return (
    <div className="topbar-container">
      <div className="round">
        {/* TODO: Add dynamic round number */}
        Round 1
      </div>
      <div className="round">
        Current player: {currentPlayerStore.currentPlayer}
      </div>
      <div className="players-row">
        {playerHandsStore.playerHands.map((hand) => (
          <div key={hand.playerName} className="player-container">
            <div className="name">{hand.playerName}</div>
            <div className="score">Score: {hand.score}</div>
            <div className="cards-number">Cards: {hand.numberOfCards}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopInfoBar;
