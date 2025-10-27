import _ from 'lodash';
import { List, Record } from 'immutable';
import type { Card } from "./types"

interface PlayerHandProps {
  playerName: string
  cards: List<Card>
  score: number
}

const PlayerHandRecord = Record<PlayerHandProps>({
  playerName: '',
  cards: List(),
  score: 0
});

export type PlayerHand = ReturnType<typeof PlayerHandRecord>;

export function player_hand(name: string): PlayerHand {
  return PlayerHandRecord({ playerName: name });
}

export function take_cards(hand: PlayerHand, cards: Card[]): PlayerHand {
  return hand.update('cards', currentCards => currentCards.concat(cards));
}

export function play_card(hand: PlayerHand, index: number): [PlayerHand, Card] {
  const card = hand.cards.get(index);
  if (!card) {
    throw new Error(`Invalid card index: ${index}`);
  }

  const newHand = hand.update('cards', cards => cards.delete(index));
  return [newHand, card];
}

export function add_score(hand: PlayerHand, points: number): PlayerHand {
  return hand.update('score', score => score + points);
}

export function reset_cards(hand: PlayerHand): PlayerHand {
  return hand.set('cards', List());
}