import { MatchModel } from "./MatchModel";
import type { MatchResponse } from "./MatchResponse";

export const mapToMatchModel = (data: MatchResponse): MatchModel => {
  return new MatchModel({
    ...data,
    matchDate: data.matchDate,
  });
};
