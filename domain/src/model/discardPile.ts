import _ from 'lodash';
import type { Card } from './types';

export type DiscardPile = Readonly<{
  cards: Card[];
}>

export function discard_pile(): DiscardPile {
  return { cards: [] };
}

export function add_card(pile: DiscardPile, card: Card): DiscardPile {
  return {
    cards: [...pile.cards, card]
  };
}

export function get_top_card(pile: DiscardPile): Card | undefined {
  return pile.cards[pile.cards.length - 1];
}

export function reset_pile(pile: DiscardPile): DiscardPile {
  return { cards: [] };
}