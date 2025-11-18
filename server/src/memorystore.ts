import { GameStore, CreateGameDTO, StoreError, CreatePlayerHandDTO, GamesNameDTO } from "./servermodel"
import { game, join_game, type Game } from "domain/src/model/Game"
import { ServerResponse } from "./response"
import { player_hand, type PlayerHand } from "domain/src/model/playerHand"
import { create_deck } from "domain/src/model/deck"
import { Card } from "domain/src/model/types"
import { Type } from "domain/src/model/types"
import { DiscardPile } from "domain/src/model/discardPile"
import { findDealer, round, Round } from "domain/src/model/round"
import { start_game as startGame } from "domain/src/model/Game"
import { standardShuffler } from "domain/src/utils/random_utils"

const not_found = (key: any): StoreError => ({ type: 'Not Found', key })

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

  // async get_game_player_hands(gamesName : GamesNameDTO): Promise<ServerResponse<PlayerHand[], StoreError>> {
  //   const targetGame = this._games.find(g => g.name === gamesName.name);

  //   if (!targetGame) {
  //     return ServerResponse.error(not_found(gamesName.name));
  //   }
  //   return ServerResponse.ok(targetGame.rounds[targetGame.currentRoundIndex].playerHands);
  // }

  // async start_game(gamesName: GamesNameDTO): Promise<ServerResponse<Game, StoreError>> {
  //   // Find the target game
  //   const targetGame = this._games.find(g => g.name === gamesName.name);
  //   if (!targetGame) {
  //     return ServerResponse.error(not_found(gamesName.name));
  //   }

  //   // Create a new deck
  //   const newDeck = create_deck();

  //   // Start the game (pure function that returns updated game)
  //   const updatedGame = startGame(targetGame, newDeck);
  //   console.log(updatedGame)

  //   // Find dealer in the current round (returns updated round)
  //   const updatedRound = findDealer(
  //     updatedGame.rounds[updatedGame.currentRoundIndex]
  //   );

  //   // Update the game with the updated round
  //   const finalGame: Game = {
  //     ...updatedGame,
  //     rounds: updatedGame.rounds.map((r, idx) =>
  //       idx === updatedGame.currentRoundIndex ? updatedRound : r
  //     ),
  //   };

  //   // Update the games array immutably
  //   this._games = this._games.map(g =>
  //     g.name === finalGame.name ? finalGame : g
  //   );

  //   return ServerResponse.ok(finalGame);
  // }

  // async take_cards(gameName: string, playerName: string, number: number): Promise<ServerResponse<Card<Type>[], StoreError>> {
  //   const targetGame = this._games.find(g => g.name === gameName);
  //   if (!targetGame) {
  //     return ServerResponse.error(not_found(gameName));
  //   }

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

  // async play_card(gameName: string, index: number): Promise<ServerResponse<boolean, StoreError>> {
  //   const targetGame = this._games.find(g => g.name === gameName);
  //   if (!targetGame) {
  //     return ServerResponse.error(not_found(gameName));
  //   }

  //   const currentPlayer = targetGame.rounds[targetGame.currentRoundIndex]?.currentPlayer
  //   if (!currentPlayer) {
  //     return ServerResponse.error(not_found(currentPlayer));
  //   }

  //   const card = currentPlayer.playerCards[index]

  //   const cardCanBePut = targetGame.rounds[targetGame.currentRoundIndex]?.putCard(card) ?? false

  //   if (cardCanBePut) {
  //     currentPlayer.playCard(index)
  //   }

  //   return ServerResponse.ok(cardCanBePut);
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