import React, { useMemo } from "react";
import './styles/TopInfoBar.css';
import { useSelector } from "react-redux";
import type { State } from "../stores/stores";
import type { OngoingGamesState } from "../slices/ongoing_games_slice";

interface TopBarProps {
  gameName: string;
}

const TopInfoBar: React.FC<TopBarProps> = ({ gameName }) => {

  const ongoingGame = useSelector<State, OngoingGamesState>(state => state.ongoing_games || []);

  const currentGame = useMemo(() => {
    return ongoingGame.find(g => g.name === gameName);
  }, [ongoingGame, gameName]);

  const currentPlayer = useMemo(() => {
    const currentRound = currentGame?.rounds[currentGame.currentRoundIndex]
    return currentRound?.playerHands[currentRound.currentPlayerIndex]
  }, [ongoingGame, gameName]);

  return (
    <div className="topbar-container">
      <div className="round">
        {/* TODO: Add dynamic round number */}
        Round 1
      </div>
      <div className="round">
        Current player: {currentPlayer?.playerName}
      </div>
      <div className="players-row">
        {currentGame?.rounds[currentGame.currentRoundIndex].playerHands.map((hand) => (
          <div key={hand.playerName} className="player-container">
            <div className="name">{hand.playerName}</div>
            <div className="score">Score: {hand.score}</div>
            <div className="cards-number">Cards: {hand.cards.length}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopInfoBar;
