import axiosClient from "./axiosClient";

const API_BASE_URL = "/season-team-coaches";

class SeasonTeamCoachService {
  // Gọi API lấy season team coaches.
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

  // Gọi API lấy season team coach by id.
  getSeasonTeamCoachById(id: number) {
    return axiosClient.get(`${API_BASE_URL}/getAssignment/${id}`);
  }

  // Gọi API tạo season team coach.
  addSeasonTeamCoach(data: any) {
    return axiosClient.post(`${API_BASE_URL}/addAssignment`, data);
  }

  // Gọi API cập nhật season team coach.
  updateSeasonTeamCoach(id: number, data: any) {
    return axiosClient.put(`${API_BASE_URL}/updateAssignment/${id}`, data);
  }

  // Gọi API xóa season team coach.
  deleteSeasonTeamCoach(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/deleteAssignment/${id}`);
  }
}

export default new SeasonTeamCoachService();
