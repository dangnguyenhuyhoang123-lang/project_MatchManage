import { MatchModel } from "../model/MatchModel";
import type { MatchResponse } from "../model/MatchResponse";

export const mapToMatchModel = (data: MatchResponse): MatchModel => {
  return new MatchModel({
    ...data,
    matchDate: data.matchDate,
  });
};
