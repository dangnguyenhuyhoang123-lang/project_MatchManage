import axiosClient from "./axiosClient";

const API_BASE_URL = "/matches";

export type MatchSupervisorReportRequest = {
  supervisorName?: string | null;
  organizationReview?: string | null;
  refereeIssueNote?: string | null;
  playerIssueNote?: string | null;
  stadiumIssueNote?: string | null;
  disciplineRecommendation?: string | null;
};

export type MatchSupervisorReportResponse = MatchSupervisorReportRequest & {
  id: number;
  matchId: number;
};

class MatchSupervisorReportService {
  // Gọi API lấy by match.
  getByMatch(matchId: number) {
    return axiosClient.get<MatchSupervisorReportResponse | null>(
      `${API_BASE_URL}/${matchId}/supervisor-report`,
    );
  }

  // Xử lý dữ liệu upsert.
  upsert(matchId: number, payload: MatchSupervisorReportRequest) {
    return axiosClient.put<MatchSupervisorReportResponse>(
      `${API_BASE_URL}/${matchId}/supervisor-report`,
      payload,
    );
  }
}

export default new MatchSupervisorReportService();
