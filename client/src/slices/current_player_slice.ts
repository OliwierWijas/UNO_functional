import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type CurrentPlayerState = {
  currentPlayer: string | null
}

const init_state: CurrentPlayerState = {
  currentPlayer: null
}

export const current_player_slice = createSlice({
  name: 'current player',
  initialState: init_state,
  reducers: {
    set: (state: CurrentPlayerState, action: PayloadAction<string>): CurrentPlayerState => {
      return { ...state, currentPlayer: action.payload }
    },
    clear: (state: CurrentPlayerState): CurrentPlayerState => {
      return { ...state, currentPlayer: null }
    }
  }
})