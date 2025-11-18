import type { Dispatch } from "@reduxjs/toolkit";
import * as api from "../model/uno-client";
import { ongoing_games_slice } from '../slices/ongoing_games_slice'

export default (name: string, playerName: string) => async (dispatch: Dispatch) => {  
  const newGame = await api.create_game(name, playerName);
  dispatch(ongoing_games_slice.actions.reset([newGame]));
}