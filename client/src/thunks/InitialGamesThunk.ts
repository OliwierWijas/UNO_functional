import type { Dispatch } from "../stores/stores"
import * as api from '../model/uno-client';
import { pending_games_slice } from "../slices/pending_games_slice";

export default () => async (dispatch: Dispatch) => {
  const pending_games = await api.get_pending_games();
  dispatch(pending_games_slice.actions.reset(pending_games));
}