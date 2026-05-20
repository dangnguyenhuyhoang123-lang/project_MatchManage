import axiosClient from "./axiosClient";

const API_BASE_URL = "/season-team-coaches";

class SeasonTeamCoachService {
  getAllSeasonTeamCoaches(page = 0, size = 10, filters?: any) {
    return axiosClient.get(`${API_BASE_URL}/getAssignments`, {
      params: {
        page,
        size,
        seasonId: filters?.seasonId || undefined,
        teamId: filters?.teamId || undefined,
        coachId: filters?.coachId || undefined,
      },
    });
  }

  getSeasonTeamCoachById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/getAssignment/${id}`);
  }

  addSeasonTeamCoach(data: any) {
    return axiosClient.post(`${API_BASE_URL}/addAssignment`, data);
  }

  updateSeasonTeamCoach(id: number, data: any) {
    return axiosClient.put(`${API_BASE_URL}/updateAssignment/${id}`, data);
  }

  deleteSeasonTeamCoach(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deleteAssignment/${id}`);
  }
}

export default new SeasonTeamCoachService();
