import _ from 'lodash';
import { List, Record } from 'immutable';
import type { Deck } from './deck'
import { reset_cards, type PlayerHand } from './playerHand'
import { round, type Round } from './round'
import { has_score_500 } from '../utils/rules_helper'
import { State } from './types'

interface GameProps {
  name: string
  playerHands: List<PlayerHand>
  rounds: List<Round>
  currentRoundIndex: number
  state: State
}

const GameRecord = Record<GameProps>({
  name: '',
  playerHands: List(),
  rounds: List(),
  currentRoundIndex: -1,
  state: "PENDING"
});

export type Game = ReturnType<typeof GameRecord>;

export function game(name: string): Game {
  return GameRecord({ name });
}

export function join_game(game: Game, playerHand: PlayerHand): Game {
  if (game.playerHands.size >= 4) {
    throw new Error("Too many players.")
  }
  
  return game.update('playerHands', hands => hands.push(playerHand));
}

export function start_game(game: Game, deck: Deck): Game {
  if (game.playerHands.size < 2) {
    throw new Error("Too few players.")
  }

  const firstRound = round(game.playerHands.toArray(), deck);
  
  return game.merge({
    rounds: List([firstRound]),
    currentRoundIndex: 0,
    state: "STARTED"
  });
}

export function next_round(game: Game, deck: Deck): Game {
  if (game.state !== "STARTED") {
    throw new Error("The game is not in started state.")
  }

  const currentRound = game.rounds.get(game.currentRoundIndex);
  
  if (!currentRound) {
    throw new Error("Current round is missing.");
  }

  const winner = has_score_500(currentRound);
  if (winner) {
    return game.set('state', "FINISHED");
  }

  if (!currentRound.isFinished) {
    return game;
  }

  const resetHands = game.playerHands.map(reset_cards).toList();
  const nextRound = round(resetHands.toArray(), deck);
  
  return game.merge({
    playerHands: resetHands,
    rounds: game.rounds.push(nextRound),
    currentRoundIndex: game.currentRoundIndex + 1
  });
}