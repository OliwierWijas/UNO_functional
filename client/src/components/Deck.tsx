import React from "react";
import deckImg from "@/components/images/Back_Card.png";
import * as api from "../model/uno-client";
import './styles/Deck.css';

interface DeckProps {
  gameName: string;
  playerName: string;
}

const Deck: React.FC<DeckProps> = ({ gameName, playerName }) => {

  const drawCard = async () => {
    await api.take_cards(gameName, playerName, 1);
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
