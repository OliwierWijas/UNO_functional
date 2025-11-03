import { map } from 'rxjs'
import * as api from '../model/uno-client'
import { pending_games_slice } from '../slices/pending_games_slice'
import type { Dispatch } from '../stores/stores'

export default async (dispatch: Dispatch) => {
  (await api.pendingGamesRxJS()).pipe(
    map(pending_games_slice.actions.reset)
  ).subscribe(dispatch)
}