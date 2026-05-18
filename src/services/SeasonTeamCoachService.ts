import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/season-team-coaches";

class SeasonTeamCoachService {
  getAllSeasonTeamCoaches(page = 0, size = 10, filters?: any) {
    return axios.get(`${API_BASE_URL}/getAssignments`, {
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
    return axios.get(`${API_BASE_URL}/getAssignment/${id}`);
  }

  addSeasonTeamCoach(data: any) {
    return axios.post(`${API_BASE_URL}/addAssignment`, data);
  }

  updateSeasonTeamCoach(id: number, data: any) {
    return axios.put(`${API_BASE_URL}/updateAssignment/${id}`, data);
  }

  deleteSeasonTeamCoach(id: number) {
    return axios.delete(`${API_BASE_URL}/deleteAssignment/${id}`);
  }
}

export default new SeasonTeamCoachService();
