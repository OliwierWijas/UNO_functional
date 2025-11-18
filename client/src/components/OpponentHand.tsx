import React from "react";
import type { PlayerHand } from "domain/src/model/playerHand";
import opponentImg from "@/components/images/opponentCards.png";
import './styles/OpponentHand.css';

interface OpponentHandProps {
  opponent: PlayerHand;
  className?: string;
}

const OpponentHand: React.FC<OpponentHandProps> = ({ opponent, className }) => {
  return (
    <div className={`opponent-container ${className || ""}`}>
      <div className="opponent-name">{opponent.playerName}</div>
      <img src={opponentImg} alt="Opponent's cards" className="opponent-card" />
    </div>
  );
};

export default OpponentHand;

