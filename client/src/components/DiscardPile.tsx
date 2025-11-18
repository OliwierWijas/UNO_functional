import React from "react";
import UnoCard from "./Card";
import './styles/DiscardPile.css';

const DiscardPile: React.FC = () => {

  const topCard = discardPileStore.topCard;

  return (
    <div>
      {topCard ? (
        <UnoCard card={topCard} />
      ) : (
        <div className="empty-space"></div>
      )}
    </div>
  );
};

export default DiscardPile;
