import * as api from "../model/uno-client";

export default (name: string, playerName: string) => {
  return async () => {
    await api.create_game(name, playerName);
  }
}