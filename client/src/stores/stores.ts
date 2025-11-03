import { configureStore } from "@reduxjs/toolkit"
import { pending_games_slice, type PendingGamesState } from "../slices/pending_games_slice"
import { ongoing_games_slice, type OngoingGamesState } from "../slices/ongoing_games_slice"
import { current_player_slice, type CurrentPlayerState } from "../slices/current_player_slice"
import { player_hands_slice, type PlayerHandsState } from "../slices/player_hand_slice"
import { discard_pile_slice, type DiscardPileState } from "../slices/discard_pile_slice"

export type State = { 
  pending_games: PendingGamesState, 
  ongoing_games: OngoingGamesState,
  current_player: CurrentPlayerState,
  discard_pile: DiscardPileState,
  player_hands: PlayerHandsState
}

export const store = configureStore<State>({
    reducer: { 
      pending_games: pending_games_slice.reducer, 
      ongoing_games: ongoing_games_slice.reducer,
      current_player: current_player_slice.reducer,
      discard_pile: discard_pile_slice.reducer,
      player_hands: player_hands_slice.reducer
    }
})

export type StoreType = typeof store
export type Dispatch = StoreType['dispatch']
export type GetState = StoreType['getState']
export type Subscriber = Parameters<StoreType['subscribe']>[0]