import React, { useMemo } from "react";
import type { PlayerHand } from "domain/src/model/playerHand";
import type { Card } from "domain/src/model/types";
import './styles/PlayerHand.css';
import UnoCard from "./Card";

interface PlayerHandProps {
  playerHand: PlayerHand;
  onCardPlayed: (payload: { cardIndex: number; card: Card }) => void;
}

const PlayerHandComponent: React.FC<PlayerHandProps> = ({ playerHand, onCardPlayed }) => {

  const spacing = 45;
  const cardWidth = 80;

  const cardStyle = (index: number) => {
    const total = playerHand.cards.length;
    const groupWidth = cardWidth + spacing * (total - 1);
    const left = `calc(50% - ${groupWidth / 2 - index * spacing}px)`;
    return {
      left,
      zIndex: index,
      position: "absolute" as const,
      bottom: 0,
      transition: "transform 0.3s ease",
      cursor: "pointer",
    };
  };

  const isCurrentPlayer = useMemo(
    () => currentPlayerStore.currentPlayer === playerHand.playerName,
    [currentPlayerStore.currentPlayer, playerHand.playerName]
  );

  const playCard = (index: number) => {
    const card = playerHand.playCard(index);
    onCardPlayed({ cardIndex: index, card });
  };

  return (
    <div className="player-hand">
      {isCurrentPlayer ? (
        <div className="hand-cards">
          {playerHand.cards.map((card, index) => (
            <UnoCard
              key={index}
              card={card}
              className="uno-card"
              style={cardStyle(index)}
              onClick={() => playCard(index)}
            />
          ))}
        </div>
      ) : (
        <div className="waiting-message">
          {currentPlayerStore.currentPlayer} is playing...
        </div>
      )}
    </div>
  );
};

export default PlayerHandComponent;
