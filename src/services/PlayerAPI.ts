import { Player } from "../model/Player";
import { my_request } from "./Request";

export async function getPlayerById(playerId: number): Promise<Player> {
  try {
    const url = `http://localhost:8080/api/player/${playerId}`;
    const responseData = await my_request(url);

    return new Player(responseData);
  } catch (error) {
    console.error("Error fetching player:", error);
    return new Player();
  }
}
