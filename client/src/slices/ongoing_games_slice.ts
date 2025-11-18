import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as _ from "lodash/fp";
import type { Game } from "domain/src/model/Game";

export type OngoingGamesState = Game[];

export const findGame = (name: string, state: OngoingGamesState): Game | undefined =>
  _.find(_.matches({ name }), state);

const init_state: OngoingGamesState = [];

const ongoing_games_reducers = {
  reset(_state: OngoingGamesState, action: PayloadAction<Game[]>): OngoingGamesState {
    console.log("erkjgbj")
    console.log(action.payload)
    return action.payload;
  },

  upsert(state: OngoingGamesState, action: PayloadAction<Game[]>): OngoingGamesState {
    console.log(action.payload)
    return action.payload
  },

  add(state: OngoingGamesState, action: PayloadAction<Game>): OngoingGamesState {
    if (!state.find(g => g.name === action.payload.name)) {
      return [...state, action.payload]
    }
    return state
  },

  remove(state: OngoingGamesState, action: PayloadAction<Game>): OngoingGamesState {
    return state.filter(game => game.name !== action.payload.name)
  }
};

export const ongoing_games_slice = createSlice({
  name: "ongoing games",
  initialState: init_state,
  reducers: ongoing_games_reducers
});
