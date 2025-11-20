import React, { useMemo } from "react";
import type { PlayerHand } from "domain/src/model/playerHand";
import './styles/PlayerHand.css';
import UnoCard from "./Card";
import { useSelector } from "react-redux";
import type { State } from "../stores/stores";
import type { OngoingGamesState } from "../slices/ongoing_games_slice";

interface PlayerHandProps {
  playerHand: PlayerHand | undefined;
  gameName: string
  //onCardPlayed: (payload: { cardIndex: number; card: Card }) => void;
}

const PlayerHandComponent: React.FC<PlayerHandProps> = ({ playerHand, gameName }) => {
  if (!playerHand) return null;

  const ongoingGame = useSelector<State, OngoingGamesState>(state => state.ongoing_games || []);

  const currentPlayer = useMemo(() => {
    const currentGame = ongoingGame.find(g => g.name === gameName);
    const currentRound = currentGame?.rounds[currentGame.currentRoundIndex]
    return currentRound?.playerHands[currentRound.currentPlayerIndex]
  }, [ongoingGame, gameName]);

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
    () => currentPlayer?.playerName === playerHand.playerName,
    [currentPlayer, playerHand.playerName]
  );

  // const playCard = (index: number) => {
  //   const card = playerHand.playCard(index);
  //   onCardPlayed({ cardIndex: index, card });
  // };

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
              //onClick={() => playCard(index)}
            />
          ))}
        </div>
      ) : (
        <div className="waiting-message">
          {currentPlayer?.playerName} is playing...
        </div>
      )}
    </div>
  );
};

export default PlayerHandComponent;
