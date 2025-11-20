import React from "react";
import UnoCard from "./Card";
import './styles/DiscardPile.css';
import type { DiscardPile } from "domain/src/model/discardPile";

interface DiscardPileProps {
  discardPile?: DiscardPile | undefined;
}

const DiscardPile: React.FC<DiscardPileProps> = ({ discardPile }) => {
  const topCard = discardPile?.cards[discardPile.cards.length - 1];

  return (
    <div className="discard-pile-container">
      {topCard ? (
        <UnoCard card={topCard} />
      ) : (
        <div className="empty-space"></div>
      )}
    </div>
  );
};

export default DiscardPile;
