import { ServerResponse } from "./response"
import { CreateGameDTO, CreatePlayerHandDTO, DiscardPileSubscription, GamesNameDTO, GameStore, PlayerHandSubscription, ServerError } from "./servermodel"
import { ServerModel } from "./servermodel"
import type { PlayerHand } from "domain/src/model/playerHand"
import { type Game } from "domain/src/model/Game"
import { Card } from "domain/src/model/types"
import { Round } from "domain/src/model/round"
import { calculate_score } from "domain/src/utils/rules_helper"

export interface Broadcaster {
  sendPendingGames: (message: CreateGameDTO[]) => Promise<void>,
  sendOngoingGame: (gameName: string, game: Game) => Promise<void>,
  // sendPlayerHands: (gameName: string, playerHands: PlayerHand[]) => Promise<void>
  // sendGameStarted: (gameName: string, game: Game) => Promise<void>
  // sendCurrentPlayer: (gameName: string, playerName: string) => Promise<void>
  // sendDiscardPile(gameName: string, cards: DiscardPileSubscription[]): Promise<void>
  // sendRoundWon: (gameName: string, round: Round) => Promise<void>;
}

export type API = {
  create_game: (name: string, playerName: string) => Promise<ServerResponse<Game, ServerError>>
  get_pending_games: () => Promise<ServerResponse<CreateGameDTO[], ServerError>>
  get_ongoing_game: (name: string) => Promise<ServerResponse<Game, ServerError>>
  create_player_hand : (playerName: string, gameName: string)  => Promise<ServerResponse<Game, ServerError>>
  // get_games: () => Promise<ServerResponse<Game[], ServerError>>
  // get_game_player_hands : (gameName: GamesNameDTO) => Promise<ServerResponse<PlayerHand[], ServerError>>
  // start_game: (gameName: GamesNameDTO) => Promise<ServerResponse<Game, ServerError>>
  // take_cards: (gameName: string, playerName: string, number: number) => Promise<ServerResponse<Card[], ServerError>>
  // play_card: (gameName: string, index: number) => Promise<ServerResponse<boolean, ServerError>>
}

export const create_api = (broadcaster: Broadcaster, store: GameStore): API => {
  const server = new ServerModel(store)

  async function create_game(game: string, playerName: string) {
    const result = await server.create_game(game, playerName);
    const newGame = await server.get_ongoing_game(game)
    
    const pendingGames = await server.get_pending_games()

    await pendingGames.process(async (pendingGames) => {
      await broadcastGames(pendingGames);
    });

    await newGame.process(async (game) => {
      await broadcastOngoingGame(game);
    });

    return result
  }

  async function get_ongoing_game(name: string) {
    const games = await server.get_ongoing_game(name)
    return games
  }

  async function broadcastGames(games: CreateGameDTO[]): Promise<void> {
    broadcaster.sendPendingGames(games)
  }

  async function broadcastOngoingGame(game: Game): Promise<void> {
    console.log("broadcasted", game)
    broadcaster.sendOngoingGame(game.name, game)
  }

  // const broadcastPlayerHands = async (gameName: string, playerHands: PlayerHand[]): Promise<void> => {
  //   await broadcaster.sendPlayerHands(gameName, playerHands)
  // }

  // async function broadcastCurrentPlayer(gameName: string, playerName: string): Promise<void> {
  //   broadcaster.sendCurrentPlayer(gameName, playerName)
  // }

  // async function broadcastDiscardPile(gameName: string, cards: DiscardPileSubscription[]): Promise<void> {
  //   console.log(cards)
  //   return broadcaster.sendDiscardPile(gameName, cards);
  // }
  
  // async function get_games() {
  //   const games = await server.get_games()
  //   return games
  // }

  async function get_pending_games() {
    const pending_games = await server.get_pending_games()
    return pending_games
  }

  async function create_player_hand(playerName: string, gameName: string){
    await server.create_player_hand(playerName, gameName);
    const game = await server.get_ongoing_game(gameName)

    await game.process(async (game) => {
      await broadcastOngoingGame(game);
    });

    return game
  }

  // async function get_game_player_hands(gameName : GamesNameDTO){
  //   const playerHands = await server.get_games_player_hands({ name: gameName.name});
  //   return playerHands
  // }

  // async function start_game(gameName: GamesNameDTO) {
  //   const result = await server.start_game(gameName);
  //   result.process(async (game) => {
  //     await broadcaster.sendGameStarted(gameName.name, game);
  //   });

  //   const currentPlayer = await server.get_current_player(gameName.name)
  //   currentPlayer.process(async (player) => {
  //     return broadcastCurrentPlayer(gameName.name, player.playerName)
  //   });

  //   return result;
  // }

  // async function take_cards(gameName: string, playerName: string, number: number) {
  //   const cards = await server.take_cards(gameName, playerName, number)

  //   // update player hands
  //   const playerHands = await server.get_games_player_hands({ name: gameName })
  //   await playerHands.process(hands => {
  //     return broadcastPlayerHands(gameName, hands);
  //   })

  //   return cards
  // }

// async function play_card(gameName: string, index: number) {
//   const cardPlayed = await server.play_card(gameName, index)

//   // Check for winner after playing card
//   if (cardPlayed) {
//     const gamesRes = await server.get_games();
//     await gamesRes.process(async (allGames) => {
//       const targetGame = allGames.find(g => g.name === gameName);
//       if (!targetGame || !targetGame.rounds[targetGame.currentRoundIndex]) return;

//       // Check if any player has 0 cards
//       const playersWithNoCards = targetGame.playerHands.filter(p => p.cards.length === 0);
//       if (playersWithNoCards.length > 0) {
//         const winner = playersWithNoCards[0];
        
//         // Calculate score for remaining players
//         const remainingPlayers = targetGame.playerHands.filter(p => p.cards.length > 0);
//         const winnerScore = calculate_score(remainingPlayers);
        
//         // Broadcast round won
//         await broadcaster.sendRoundWon(gameName, targetGame.rounds[targetGame.currentRoundIndex]);
//       }
//     });

//     // update discard pile
//     const discardPile = await server.get_discard_pile(gameName)
//     await discardPile.process(discardPile => {
//       const mappedCards: DiscardPileSubscription[] = discardPile.cards.map(card => ({
//         color: 'color' in card ? card.color : null,
//         digit: card.type === 'NUMBERED' ? card.number : null,
//         type: card.type
//       }));
//       return broadcastDiscardPile(gameName, mappedCards);
//     });

//     const currentPlayer = await server.get_current_player(gameName)
//     currentPlayer.process(async (player) => {
//       return broadcastCurrentPlayer(gameName, player.playerName)
//     });

//     // update player hands
//     const playerHands = await server.get_games_player_hands({ name: gameName })
//     await playerHands.process(hands => {
//       const subscriptionHands = hands.map(mapPlayerHandToSubscription)
//       return broadcastPlayerHands(gameName, subscriptionHands);
//     })
//   }

//   return cardPlayed
// }

// async function round_won(gameName: string): Promise<ServerResponse<void, ServerError>> {
//   const gamesRes = await server.get_games();

//   return gamesRes.flatMap(async (all) => {
//     const game = all.find((g: any) => g.name === gameName);
//     if (!game || !game.rounds[game.currentRoundIndex]) {
//       return ServerResponse.error<ServerError>({ type: "Not Found", key: gameName });
//     }

//     const round = game.rounds[game.currentRoundIndex];
//     const result = await server.round_won(gameName, round);

//     await result.process(async () => {
//       await broadcaster.sendRoundWon(gameName, round);
//     });

//     // simply cast StoreError → ServerError
//     return result as unknown as ServerResponse<void, ServerError>;
//   });
// }

  return {
    create_game,
    get_pending_games,
    get_ongoing_game,
    create_player_hand,
    // get_games,
    // get_game_player_hands,
    // start_game,
    // take_cards,
    // play_card,
    // round_won
  }
}