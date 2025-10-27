// round.ts
import _ from 'lodash';
import { List, Record } from 'immutable';
import type { Card } from './types'
import { draw_cards, type Deck } from './deck'
import { add_score, play_card, take_cards, type PlayerHand } from './playerHand'
import type { DiscardPile } from './discardPile'
import { can_be_put_on_top, calculate_score, has_score_500 } from '../utils/rules_helper'
import { add_card, discard_pile, get_top_card } from './discardPile'

interface RoundProps {
  playerHands: List<PlayerHand>
  deck: Deck
  discardPile: DiscardPile
  currentPlayerIndex: number
  isFinished: boolean
}

const RoundRecord = Record<RoundProps>({
  playerHands: List(),
  deck: null as any,
  discardPile: discard_pile(),
  currentPlayerIndex: 0,
  isFinished: false
});

export type Round = ReturnType<typeof RoundRecord>;

export function round(hands: PlayerHand[], deck: Deck): Round {
  return RoundRecord({
    playerHands: List(hands),
    deck,
    currentPlayerIndex: 0,
    isFinished: false
  });
}

export function next_player(round: Round): Round {
  const nextIndex = (round.currentPlayerIndex + 1) % round.playerHands.size;
  return round.set('currentPlayerIndex', nextIndex);
}

export function put_card(round: Round, playerIndex: number, cardIndex: number): Round {
  const topCard = get_top_card(round.discardPile);
  
  // Validate player index
  if (!_.inRange(playerIndex, 0, round.playerHands.size)) {
    throw new Error(`Invalid player index: ${playerIndex}`);
  }
  
  const currentHand = round.playerHands.get(playerIndex);
  if (!currentHand) {
    throw new Error(`Player hand not found at index: ${playerIndex}`);
  }
  
  const [newHand, playedCard] = play_card(currentHand, cardIndex);
  
  if (!can_be_put_on_top(topCard, playedCard)) {
    throw new Error("Invalid card play");
  }

  let updatedRound: Round = round
    .update('playerHands', hands => hands.set(playerIndex, newHand))
    .update('discardPile', pile => add_card(pile, playedCard));

  // Check if player won
  if (newHand.cards.size === 0) {
    const score = calculate_score(updatedRound.playerHands.toArray());
    updatedRound = updatedRound
      .update('playerHands', hands => 
        hands.map((hand, idx) => 
          idx === playerIndex ? add_score(hand, score) : hand
        )
      )
      .set('isFinished', true);
    
    return updatedRound;
  }

  // Handle special cards
  switch (playedCard.type) {
    case 'REVERSE':
      updatedRound = updatedRound
        .update('playerHands', hands => hands.reverse())
        .update('currentPlayerIndex', idx => 
          (updatedRound.playerHands.size - 1 - idx) % updatedRound.playerHands.size
        );
      updatedRound = next_player(updatedRound);
      break;

    case 'SKIP':
      updatedRound = next_player(next_player(updatedRound));
      break;

    case 'DRAW2':
      updatedRound = handle_draw_card(next_player(updatedRound), 2);
      break;

    case 'DRAW4':
      updatedRound = handle_draw_card(next_player(updatedRound), 4);
      break;

    case 'WILD':
    case 'NUMBERED':
      updatedRound = next_player(updatedRound);
      break;
  }

  return updatedRound;
}

function handle_draw_card(round: Round, count: number): Round {
  const currentPlayerIdx = round.currentPlayerIndex;
  
  // Validate current player index
  if (!_.inRange(currentPlayerIdx, 0, round.playerHands.size)) {
    throw new Error(`Invalid current player index: ${currentPlayerIdx}`);
  }
  
  const currentHand = round.playerHands.get(currentPlayerIdx);
  if (!currentHand) {
    throw new Error(`Player hand not found at index: ${currentPlayerIdx}`);
  }
  
  const [newDeck, drawnCards] = draw_cards(round.deck, count);
  const updatedHand = take_cards(currentHand, drawnCards);
  
  return round
    .set('deck', newDeck)
    .update('playerHands', hands => hands.set(currentPlayerIdx, updatedHand));
}