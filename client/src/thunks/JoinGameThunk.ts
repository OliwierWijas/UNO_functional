import type { Dispatch } from "@reduxjs/toolkit";
import * as api from "../model/uno-client";
import { ongoing_games_slice } from '../slices/ongoing_games_slice'

export default (gameName: string, playerName: string) => async (dispatch: Dispatch) => {  
  const newGame = await api.create_player_hand(playerName, gameName)
  dispatch(ongoing_games_slice.actions.reset([newGame]));
}