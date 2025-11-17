// round.ts
import _ from 'lodash';
import { draw_cards, type Deck } from './deck'
import { add_score, play_card, take_cards, type PlayerHand } from './playerHand'
import type { DiscardPile } from './discardPile'
import { can_be_put_on_top, calculate_score, has_score_500 } from '../utils/rules_helper'
import { add_card, discard_pile, get_top_card } from './discardPile'

export interface Round {
  readonly playerHands: PlayerHand[];
  readonly deck: Deck;
  readonly discardPile: DiscardPile;
  readonly currentPlayerIndex: number;
  readonly isFinished: boolean;
}

export function round(hands: PlayerHand[], deck: Deck): Round {
  return {
    playerHands: hands,
    deck,
    discardPile: discard_pile(),
    currentPlayerIndex: 0,
    isFinished: false
  };
}

export function next_player(r: Round): Round {
  const nextIndex = (r.currentPlayerIndex + 1) % r.playerHands.length;

  return {
    ...r,
    currentPlayerIndex: nextIndex
  };
}

export function put_card(
  r: Round,
  playerIndex: number,
  cardIndex: number
): Round {
  const topCard = get_top_card(r.discardPile);

  // Validate player index
  if (!_.inRange(playerIndex, 0, r.playerHands.length)) {
    throw new Error(`Invalid player index: ${playerIndex}`);
  }

  const currentHand = r.playerHands[playerIndex];
  if (!currentHand) throw new Error(`No hand at index: ${playerIndex}`);

  const [newHand, playedCard] = play_card(currentHand, cardIndex);

  if (!can_be_put_on_top(topCard, playedCard)) {
    throw new Error("Invalid card play");
  }

  // Update round state immutably
  let updated = {
    ...r,
    playerHands: r.playerHands.map((hand, idx) =>
      idx === playerIndex ? newHand : hand
    ),
    discardPile: add_card(r.discardPile, playedCard)
  };

  if (newHand.cards.length === 0) {
    const score = calculate_score(updated.playerHands);

    const updatedHands = updated.playerHands.map((hand, idx) =>
      idx === playerIndex ? add_score(hand, score) : hand
    );

    return {
      ...updated,
      playerHands: updatedHands,
      isFinished: true
    };
  }

  // Handle special cards
  switch (playedCard.type) {
    case 'REVERSE': {
      const reversedHands = [...updated.playerHands].reverse();

      const newIndex =
        (reversedHands.length - 1 - updated.currentPlayerIndex) %
        reversedHands.length;

      updated = {
        ...updated,
        playerHands: reversedHands,
        currentPlayerIndex: newIndex
      };

      return next_player(updated);
    }

    case 'SKIP':
      return next_player(next_player(updated));

    case 'DRAW2':
      return handle_draw_card(next_player(updated), 2);

    case 'DRAW4':
      return handle_draw_card(next_player(updated), 4);

    case 'WILD':
    case 'NUMBERED':
      return next_player(updated);
  }

  return updated;
}

function handle_draw_card(r: Round, count: number): Round {
  const idx = r.currentPlayerIndex;

  if (!_.inRange(idx, 0, r.playerHands.length)) {
    throw new Error(`Invalid current player index: ${idx}`);
  }

  const hand = r.playerHands[idx];
  const [newDeck, drawn] = draw_cards(r.deck, count);
  const newHand = take_cards(hand, drawn);

  return {
    ...r,
    deck: newDeck,
    playerHands: r.playerHands.map((h, i) =>
      i === idx ? newHand : h
    )
  };
}