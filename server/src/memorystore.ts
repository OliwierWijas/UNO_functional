import { GameStore, CreateGameDTO, StoreError, CreatePlayerHandDTO, GamesNameDTO } from "./servermodel"
import { game, join_game, type Game } from "domain/src/model/Game"
import { ServerResponse } from "./response"
import { player_hand, take_cards as takeCards} from "domain/src/model/playerHand"
import { create_deck, draw_cards } from "domain/src/model/deck"
import { Card } from "domain/src/model/types"
import { Type } from "domain/src/model/types"
import { DiscardPile } from "domain/src/model/discardPile"
import { findDealer, next_player, round, Round } from "domain/src/model/round"
import { start_game as startGame } from "domain/src/model/Game"
import { standardShuffler } from "domain/src/utils/random_utils"
import { can_be_put_on_top } from "domain/src/utils/rules_helper"

const not_found = (key: any): StoreError => ({ type: 'Not Found', key })
const card_cannot_be_put = (key: any): StoreError => ({ type: 'Card cannot be put on top.', key })

const game_full = (key: any): StoreError => ({ type: 'Game has too much Players', key })
export class MemoryStore implements GameStore {
  private _games: Game[]

  constructor(...games: Game[]) {
    this._games = [...games]
  }

  async create_game(name: string, playerName: string) : Promise<ServerResponse<Game, StoreError>> {
    const initialPlayer = player_hand(playerName)
    const initialRound = round([initialPlayer], create_deck())

    const newGame = game(name, initialRound)
    this._games.push(newGame)
    
    return ServerResponse.ok(newGame)
  }

  async get_ongoing_game(name: string) {
    const game = this._games.find(g => g.name === name);

    if (game === undefined) {
      return ServerResponse.error(not_found("Game not found."))
    }

    return ServerResponse.ok(game);
  }

  // async get_games() {
  //   console.log(this._games)
  //   return ServerResponse.ok([...this._games])
  // }

  async get_pending_games() {
    const pendingGames = this._games
      .filter(g => g.state === "PENDING")
      .map(g => ({
        name: g.name,
      }) as CreateGameDTO);

    return ServerResponse.ok(pendingGames);
  }

  async create_player_hand(playerName: string, gameName: string): Promise<ServerResponse<void, StoreError>> {
    const targetGame = this._games.find(g => g.name === gameName);

    if (!targetGame) {
      return ServerResponse.error(not_found(gameName));
    }

    if (!targetGame.rounds[targetGame.currentRoundIndex]) {
      return ServerResponse.error(not_found("Round not found."))
    }

    if (targetGame.rounds[targetGame.currentRoundIndex].playerHands.length >= 4) {
      return ServerResponse.error(game_full(gameName));
    }

    const newPlayerHand = player_hand(playerName);

    const updatedGame = join_game(targetGame, newPlayerHand);

    this._games = this._games.map(g =>
      g.name === updatedGame.name ? updatedGame : g
    );

    return ServerResponse.ok(undefined);
  }

  async start_game(gameName: string): Promise<ServerResponse<void, StoreError>> {
    // Find the target game
    const targetGame = this._games.find(g => g.name === gameName);

    if (!targetGame) {
      return ServerResponse.error(not_found(gameName));
    }

    const currentRound = targetGame.rounds[targetGame.currentRoundIndex];

    const updatedPlayerHands = currentRound.playerHands.map(player => {
      const [updatedDeck, drawnCards] = draw_cards(currentRound.deck, 7);
      currentRound.deck = updatedDeck;
      return takeCards(player, drawnCards);
    });

    const updatedRound = {
      ...currentRound,
      playerHands: updatedPlayerHands,
      deck: currentRound.deck
    };

    const updatedRounds = targetGame.rounds.map((r, idx) =>
      idx === targetGame.currentRoundIndex ? updatedRound : r
    );

    const updatedGameRounds = {
      ...targetGame,
      rounds: updatedRounds
    };

    const updatedGame = startGame(updatedGameRounds)

    this._games = this._games.map(g =>
      g.name === updatedGame.name ? updatedGame : g
    );

    return ServerResponse.ok(undefined);
  }

  async take_cards(gameName: string, playerName: string, number: number): Promise<ServerResponse<void, StoreError>> {
    const targetGame = this._games.find(g => g.name === gameName);

    if (!targetGame) {
      return ServerResponse.error(not_found(gameName));
    }

    const targetPlayer = targetGame.rounds[targetGame.currentRoundIndex].playerHands.find(p => p.playerName === playerName)

    if (!targetPlayer) {
      return ServerResponse.error(not_found(playerName));
    }

    const [updatedDeck, drawnCards] = draw_cards(targetGame.rounds[targetGame.currentRoundIndex].deck, number);

    const updatedPlayer = takeCards(targetPlayer, drawnCards)

    const updatedPlayerHands = targetGame.rounds[targetGame.currentRoundIndex].playerHands.map(p =>
      p.playerName === updatedPlayer.playerName ? updatedPlayer : p
    );

    const updatedRound = {
      ...targetGame.rounds[targetGame.currentRoundIndex],
      deck: updatedDeck,
      playerHands: updatedPlayerHands
    };

    let updatedRoundNextPlayer = updatedRound

    if (number === 1) {
      updatedRoundNextPlayer = next_player(updatedRound)
    }

    const updatedRounds = targetGame.rounds.map((r, idx) =>
      idx === targetGame.currentRoundIndex ? updatedRoundNextPlayer : r
    );

    const updatedGame = {
      ...targetGame,
      rounds: updatedRounds
    };

    this._games = this._games.map(g =>
      g.name === updatedGame.name ? updatedGame : g
    );

    return ServerResponse.ok(undefined)
  }

  async play_card(gameName: string, index: number): Promise<ServerResponse<void, StoreError>> {
    const targetGame = this._games.find(g => g.name === gameName);
    if (!targetGame) {
      return ServerResponse.error(not_found(gameName));
    }

    const round = targetGame.rounds[targetGame.currentRoundIndex]
    const currentPlayer = round.playerHands[round.currentPlayerIndex]

    if (!currentPlayer) {
      return ServerResponse.error(not_found(currentPlayer));
    }

    const cardToBePut = currentPlayer.cards[index]
    const topCard = round.discardPile.cards[round.discardPile.cards.length - 1]

    const canBePutOnTop = can_be_put_on_top(topCard, cardToBePut)

    if (!canBePutOnTop) {
      return ServerResponse.error(card_cannot_be_put(cardToBePut))
    }

    // remove card from playerhand
    const newPlayerHand = {
      ...currentPlayer,
      cards: currentPlayer.cards.filter((_, i) => i !== index),
    };

    // add card to deck
    const newDiscardPile = {
      ...round.discardPile,
      cards: [...round.discardPile.cards, cardToBePut]
    };

    // update player hands
    const updatedPlayerHands = round.playerHands.map((p, i) =>
      i === round.currentPlayerIndex ? newPlayerHand : p
    );

    //update rounds
    const updatedRound = {
      ...round,
      playerHands: updatedPlayerHands,
      discardPile: newDiscardPile
    };

    const updatedRoundNextPlayer = next_player(updatedRound)

    const updatedRounds = targetGame.rounds.map((r, i) =>
      i === targetGame.currentRoundIndex ? updatedRoundNextPlayer : r
    );

    //update game
    const updatedGame = {
      ...targetGame,
      rounds: updatedRounds
    };

    console.log(newDiscardPile.cards)

    //save it to the store
    this._games = this._games.map(g =>
      g.name === gameName ? updatedGame : g
    );

    return ServerResponse.ok(undefined);
  }


  // async get_game_player_hands(gamesName : GamesNameDTO): Promise<ServerResponse<PlayerHand[], StoreError>> {
  //   const targetGame = this._games.find(g => g.name === gamesName.name);

  //   if (!targetGame) {
  //     return ServerResponse.error(not_found(gamesName.name));
  //   }
  //   return ServerResponse.ok(targetGame.rounds[targetGame.currentRoundIndex].playerHands);
  // }

  //   const player = targetGame.playerHands.find(p => p.playerName === playerName)
  //   if (!player) {
  //     return ServerResponse.error(not_found(playerName));
  //   }

  //   const deck = targetGame.rounds[targetGame.currentRoundIndex]?.deck
    
  //   let cards: Card[] = [];
  //   if (deck) {
  //     cards = deck.drawCards(number)
  //   }

  //   player.takeCards(cards)
  //   return ServerResponse.ok(cards)
  // }

  // async get_current_player(gameName: string): Promise<ServerResponse<PlayerHand, StoreError>> {
  //   const targetGame = this._games.find(g => g.name === gameName);
  //   if (!targetGame) {
  //     return ServerResponse.error(not_found(gameName));
  //   }

  //   const currentPlayer = targetGame.rounds[targetGame.currentRoundIndex]?.currentPlayer
  //   if (!currentPlayer) {
  //     return ServerResponse.error(not_found(currentPlayer));
  //   }

  //   return ServerResponse.ok(currentPlayer);
  // }
  
  // async get_discard_pile(gameName: string): Promise<ServerResponse<DiscardPile, StoreError>> {
  //   const targetGame = this._games.find(g => g.name === gameName);
  //   if (!targetGame) {
  //     return ServerResponse.error(not_found(gameName));
  //   }

  //   const currentRound = targetGame.rounds[targetGame.currentRoundIndex]
  //   if (!currentRound) {
  //     return ServerResponse.error(not_found(currentRound));
  //   }

  //   const discardPile = currentRound.discardPile

  //   return ServerResponse.ok(discardPile);
  // }

  //  async round_won(gameName: string, round: Round): Promise<ServerResponse<void, StoreError>> {
  //   const targetGame = this._games.find((g) => g.name === gameName);
  //   if (!targetGame) {
  //     return ServerResponse.error(not_found(gameName));
  //   }

  //   const newDeck = create_deck();

  //   // This triggers next round logic — handled by domain/game.ts
  //   const winner = targetGame.nextRound(newDeck);

  //   // Optionally log or handle the winner
  //   if (winner) {
  //     console.log(`🎉 Round won by ${winner.playerName} with score ${winner.score}`);
  //   }

  //   return ServerResponse.ok(undefined);
  // }
}