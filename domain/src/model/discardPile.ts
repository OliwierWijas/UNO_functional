import _ from 'lodash';
import { List } from 'immutable';
import type { Card } from './types';

export type DiscardPile = Readonly<{
  cards: List<Card>;
}>

export function discard_pile(): DiscardPile {
  return { cards: List() };
}

export function add_card(pile: DiscardPile, card: Card): DiscardPile {
  return {
    cards: pile.cards.push(card)
  };
}

export function get_top_card(pile: DiscardPile): Card | undefined {
  return pile.cards.last();
}

export function reset_pile(pile: DiscardPile): DiscardPile {
  return { cards: List() };
}