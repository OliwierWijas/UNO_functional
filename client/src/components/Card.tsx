import React, { useMemo } from "react";
import type { Card as CardType } from "domain/src/model/types";
import type { Type } from "domain/src/model/types";
import './styles/Card.css';

interface UnoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  card: CardType;
}

const UnoCard: React.FC<UnoCardProps> = ({ card, className, style, ...rest }) => {

  const isColoredCard = (card: CardType): card is Extract<CardType, { color: string }> => {
    return 'color' in card;
  };

  const isNumberedCard = (card: CardType): card is Extract<CardType, { type: 'NUMBERED'; number: number }> => {
    return card.type === 'NUMBERED';
  };

  const numberedImageMap: Record<Extract<Type, 'NUMBERED'>, (card: Extract<CardType, { color: string; number: number }>) => string> = {
    NUMBERED: (card) => `/src/components/images/${card.color}_${card.number}.png`,
  };

  const coloredImageMap: Record<Exclude<Type, 'WILD' | 'DRAW4' | 'NUMBERED'>, (card: Extract<CardType, { color: string }>) => string> = {
    SKIP: (card) => `/src/components/images/${card.color}_Skip.png`,
    REVERSE: (card) => `/src/components/images/${card.color}_Reverse.png`,
    DRAW2: (card) => `/src/components/images/${card.color}_Draw_2.png`,
  };
  

  const wildImageMap: Record<'WILD' | 'DRAW4', string> = {
    WILD: `/src/components/images/Wild_Card_Change_Colour.png`,
    DRAW4: `/src/components/images/Wild_Card_Draw_4.png`,
  };

  const cardImage = useMemo(() => {
    if (isNumberedCard(card)) {
      return numberedImageMap[card.type](card);
    } else if (isColoredCard(card) && card.type in coloredImageMap) {
      return coloredImageMap[card.type as keyof typeof coloredImageMap](card as any);
    } else if (card.type in wildImageMap) {
      return wildImageMap[card.type as 'WILD' | 'DRAW4'];
    } else {
      console.warn('Unknown card type:', card);
      return '/src/components/images/default_card.png';
    }
  }, [card]);

  return (
    <div className="card-container" style={style} {...rest}>
      <img src={cardImage} alt="UNO Card" className="card-image" />
    </div>
  );
};

export default UnoCard;
