import type { NavigateFunction } from "react-router-dom";
import * as api from "../model/uno-client";

export default (gameName: string, navigate: NavigateFunction) => {
  return async () => {
    await api.create_game(gameName);
    //navigate(`/game?playerName=${playerName}&gameName=${gameName}`);
  }
}