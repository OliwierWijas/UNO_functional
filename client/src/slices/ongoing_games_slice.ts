import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import * as _ from 'lodash/fp'

export type Game = {
  name: string
  state: "PENDING" | "STARTED" | "FINISHED"
  playerHands: PlayerHandSubscription[]
}

export type PlayerHandSubscription = {
  playerName: string
  numberOfCards: number
  score: number
}

export type OngoingGamesState = Readonly<Game[]>

export const game = (name: string, state: OngoingGamesState): Game | undefined => 
  _.find(_.matches({ name }), state)

const init_state: OngoingGamesState = []

const ongoing_games_reducers = {
  reset(_state: OngoingGamesState, action: PayloadAction<Game[]>): OngoingGamesState {
    return action.payload
  },

  upsert(state: OngoingGamesState, action: PayloadAction<Game>): OngoingGamesState {
    const index = _.findIndex(_.matches({ name: action.payload.name }), state)
    if (index === -1)
      return [...state, action.payload]
    return _.set(index, action.payload, state)
  },

  addGame(state: OngoingGamesState, action: PayloadAction<Game>): OngoingGamesState {
    if (!state.find(g => g.name === action.payload.name)) {
      return [...state, action.payload]
    }
    return state
  },

  removeGame(state: OngoingGamesState, action: PayloadAction<string>): OngoingGamesState {
    return state.filter(game => game.name !== action.payload)
  },

  updateGame(state: OngoingGamesState, action: PayloadAction<Game>): OngoingGamesState {
    const index = state.findIndex(g => g.name === action.payload.name)
    if (index !== -1) {
      return _.set(index, action.payload, state)
    }
    return [...state, action.payload]
  }
}

export const ongoing_games_slice = createSlice({
  name: 'ongoing games',
  initialState: init_state,
  reducers: ongoing_games_reducers
})