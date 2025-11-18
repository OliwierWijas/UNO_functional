import * as api from '../model/uno-client'
import type { Dispatch } from '../stores/stores'
import { ongoing_games_slice } from '../slices/ongoing_games_slice'
import type { Game } from 'domain/src/model/game'

export default (gameName: string) => async (dispatch: Dispatch) => {
  const ongoing_game_subject = await api.ongoingGameRxJS(gameName);
  
  ongoing_game_subject.subscribe((ongoing_game: Game) => {
    const gamesArray = [ongoing_game];
    dispatch(ongoing_games_slice.actions.reset(gamesArray));
  });
}