import * as api from "../model/uno-client";

export default (gameName: string, playerName: string) => {
  return async () => {
    await api.create_player_hand(playerName, gameName)
        .catch((error: any) => {
          console.error('Error in joinGame:', error);
          alert("Game has too many players!");
        });
  }
}