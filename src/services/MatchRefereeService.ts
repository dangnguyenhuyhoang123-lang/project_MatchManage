import axiosClient from "./axiosClient";

const API_BASE_URL = "/match-referees";

export type MatchRefereeAssignRequest = {
  matchId: number;
  refereeId: number;
  role: string;
  note?: string | null;
};

export type MatchRefereeResponse = {
  id: number;
  matchId: number;
  refereeId: number;
  refereeName: string;
  refereeNationality?: string | null;
  role: string;
  note?: string | null;
};

class MatchRefereeService {
  // Xử lý dữ liệu assign.
  assign(payload: MatchRefereeAssignRequest) {
    return axiosClient.post<MatchRefereeResponse>(API_BASE_URL, payload);
  }

  // Gọi API lấy by match.
  getByMatch(matchId: number) {
    return axiosClient.get<MatchRefereeResponse[]>(
      `${API_BASE_URL}/match/${matchId}`,
    );
  }

  // Gọi API xóa remove.
  remove(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new MatchRefereeService();
