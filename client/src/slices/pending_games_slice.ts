import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import * as _ from 'lodash/fp'

export type SimpleGameDTO = {
  name: string
}

export type PendingGamesState = Readonly<SimpleGameDTO[]>

export const game = (name: string, state: PendingGamesState): SimpleGameDTO | undefined => 
  _.find(_.matches({ name }), state)

const init_state: PendingGamesState = []

const pending_games_reducers = {
  reset(_state: PendingGamesState, action: PayloadAction<SimpleGameDTO[]>): PendingGamesState {
    return action.payload
  },

  upsert(state: PendingGamesState, action: PayloadAction<SimpleGameDTO[]>): PendingGamesState {
    return action.payload
  },

  add(state: PendingGamesState, action: PayloadAction<SimpleGameDTO>): PendingGamesState {
    if (!state.find(g => g.name === action.payload.name)) {
      return [...state, action.payload]
    }
    return state
  },

  remove(state: PendingGamesState, action: PayloadAction<SimpleGameDTO>): PendingGamesState {
    return state.filter(game => game.name !== action.payload.name)
  }
}

export const pending_games_slice = createSlice({
  name: 'pending games',
  initialState: init_state,
  reducers: pending_games_reducers
})