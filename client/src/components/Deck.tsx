import React, { useMemo } from "react";
import deckImg from "@/components/images/Back_Card.png";
import * as api from "../model/uno-client";
import './styles/Deck.css';
import { useSelector } from "react-redux";
import type { State } from "../stores/stores";
import type { OngoingGamesState } from "../slices/ongoing_games_slice";

interface DeckProps {
  gameName: string;
  playerName: string;
}

const Deck: React.FC<DeckProps> = ({ gameName, playerName }) => {

  const ongoingGame = useSelector<State, OngoingGamesState>(state => state.ongoing_games || []);

  const currentPlayer = useMemo(() => {
    const currentGame = ongoingGame.find(g => g.name === gameName);
    const currentRound = currentGame?.rounds[currentGame.currentRoundIndex]
    return currentRound?.playerHands[currentRound.currentPlayerIndex]
  }, [ongoingGame, gameName]);

  const drawCard = async () => {
    if (currentPlayer?.playerName === playerName) {
      await api.take_cards(gameName, playerName, 1);
    }
  };

  return (
    <div className="deck-container">
      <img
        src={deckImg}
        alt="Deck"
        className="deck-image"
        onClick={drawCard}
      />
    </div>
  );
};

export default Deck;
