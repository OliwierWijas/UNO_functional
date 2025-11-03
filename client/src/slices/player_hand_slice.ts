import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type PlayerHandSubscription = {
  playerName: string
  numberOfCards: number
  score: number
}

export type PlayerHandsState = Readonly<PlayerHandSubscription[]>

const init_state: PlayerHandsState = []

const player_hands_reducers = {
  update(state: PlayerHandsState, action: PayloadAction<PlayerHandSubscription[]>): PlayerHandsState {
    return action.payload
  },

  clear(_state: PlayerHandsState): PlayerHandsState {
    return []
  }
}

export const player_hands_slice = createSlice({
  name: 'player hands',
  initialState: init_state,
  reducers: player_hands_reducers
})