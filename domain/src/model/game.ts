import _ from 'lodash';
import type { Deck } from './deck'
import { reset_cards, type PlayerHand } from './playerHand'
import { round, type Round } from './round'
import { has_score_500 } from '../utils/rules_helper'
import { State } from './types'

export interface Game {
  name: string
  rounds: Round[];
  currentRoundIndex: number
  state: State
}

export function game(name: string, initialRound: Round): Game {
  return {
    name,
    rounds: [initialRound],
    currentRoundIndex: 0,
    state: "PENDING"
  };
}

export function join_game(g: Game, hand: PlayerHand): Game {
  const currentRound = g.rounds[g.currentRoundIndex];

  if (currentRound.playerHands.length >= 4) {
    throw new Error("Too many players.");
  }

  // Create updated round with new player hand
  const updatedRound = {
    ...currentRound,
    playerHands: [...currentRound.playerHands, hand],
  };

  // Return updated game with updated rounds
  return {
    ...g,
    rounds: g.rounds.map((r, idx) =>
      idx === g.currentRoundIndex ? updatedRound : r
    ),
  };
}


export function start_game(g: Game, deck: Deck): Game {
  if (g.rounds[g.currentRoundIndex].playerHands.length < 2) {
    throw new Error("Too few players.");
  }

  const firstRound = round([...g.rounds[g.currentRoundIndex].playerHands], deck);

  return {
    ...g,
    rounds: [firstRound],
    currentRoundIndex: 0,
    state: "STARTED"
  };
}

export function next_round(g: Game, deck: Deck): Game {
  if (g.state !== "STARTED") {
    throw new Error("The game is not in started state.");
  }

  const currentRound = g.rounds[g.currentRoundIndex];
  if (!currentRound) {
    throw new Error("Current round is missing.");
  }

  const winner = has_score_500(currentRound);
  if (winner) {
    return { ...g, state: "FINISHED" };
  }

  if (!currentRound.isFinished) return g;

  const resetHands = g.rounds[g.currentRoundIndex].playerHands.map(reset_cards);
  const nextRound = round([...resetHands], deck);

  return {
    ...g,
    rounds: [...g.rounds, nextRound],
    currentRoundIndex: g.currentRoundIndex + 1
  };
}