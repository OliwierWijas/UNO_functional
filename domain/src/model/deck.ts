import _ from 'lodash';
import { List } from 'immutable';
import type { Card } from './types';
import type { Color, Digit, Type } from './types';
import { standardShuffler } from '../utils/random_utils';
import { numbered_card, action_card, wild_card } from './card';

export type Deck = Readonly<{
  cards: List<Card>; 
}>

const DIGITS: readonly Digit[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const COLORS: Color[] = ['BLUE', 'RED', 'GREEN', 'YELLOW'];

function create_numbered_cards(color: Color): Card[] {
  return _.flatMap([
    _.map(DIGITS, n => numbered_card(color, n)),
    _.map(DIGITS.slice(1), n => numbered_card(color, n))
  ]);
}

function create_action_cards(): Card[] {
  const types: Extract<Type, 'SKIP' | 'REVERSE' | 'DRAW2'>[] = ['SKIP', 'REVERSE', 'DRAW2'];
  return _.flatMap(types, type =>
    _.flatMap(COLORS, color =>
      _.times(2, () => action_card(type, color))
    )
  );
}

function create_wild_cards(): Card[] {
  return [
    ..._.times(4, () => wild_card('WILD')),
    ..._.times(4, () => wild_card('DRAW4')),
  ];
}

export function create_deck(): Deck {
  const cards = _.flow([
    () => _.flatMap(COLORS, create_numbered_cards),
    numberedCards => _.concat(
      numberedCards,
      create_action_cards(),
      create_wild_cards()
    ),
    standardShuffler
  ])();
  
  return {
    cards: List(cards)
  };
}

export function draw_cards(deck: Deck, count: number): [Deck, Card[]] {
  const drawn = deck.cards.take(count).toArray();
  const remaining = deck.cards.skip(count);
  return [{ cards: remaining }, drawn];
}

export function shuffle_deck(deck: Deck): Deck {
  const shuffledArray = standardShuffler(deck.cards.toArray());
  return { cards: List(shuffledArray) };
}