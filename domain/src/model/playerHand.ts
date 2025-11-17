import _ from 'lodash';
import type { Card } from "./types"

export interface PlayerHand {
  playerName: string;
  cards: Card[];
  score: number;
}

export function player_hand(name: string): PlayerHand {
  return {
    playerName: name,
    cards: [],
    score: 0
  };
}

export function take_cards(hand: PlayerHand, cards: Card[]): PlayerHand {
  return {
    ...hand,
    cards: [...hand.cards, ...cards]
  };
}


export function play_card(
  hand: PlayerHand,
  index: number
): [PlayerHand, Card] {
  const card = hand.cards[index];
  if (!card) {
    throw new Error(`Invalid card index: ${index}`);
  }

  const newCards = hand.cards.filter((_, i) => i !== index);

  return [
    {
      ...hand,
      cards: newCards
    },
    card
  ];
}

export function add_score(hand: PlayerHand, points: number): PlayerHand {
  return {
    ...hand,
    score: hand.score + points
  };
}


export function reset_cards(hand: PlayerHand): PlayerHand {
  return {
    ...hand,
    cards: []
  };
}