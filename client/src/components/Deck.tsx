import React from "react";
import deckImg from "@/components/images/Back_Card.png";
import type { Card } from "domain/src/model/types";
import * as api from "../model/uno-client";
import './styles/Deck.css';

interface DeckProps {
  gameName: string;
  playerName: string;
  onCardDrawn: (card: Card) => void;
}

const Deck: React.FC<DeckProps> = ({ gameName, playerName, onCardDrawn }) => {

  const drawCard = async () => {
    const cards = await api.take_cards(gameName, playerName, 1);
    const drawn = cards[0];
    onCardDrawn(drawn);
    return drawn;
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
