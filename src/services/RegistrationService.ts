import axios from "axios";
import type {
  FullRegistrationDTO,
  MessageResponse,
  RegistrationDetailDTO,
  RegistrationStatus,
  RegistrationSummaryDTO,
} from "../model/Registration";

const API_BASE_URL = "http://localhost:8080/api/registrations";

class RegistrationService {
  getAllRegistrations(status?: RegistrationStatus | "Tất cả") {
    return axios.get<RegistrationSummaryDTO[]>(
      `${API_BASE_URL}/getRegistrations`,
      {
        params: {
          status: status && status !== "Tất cả" ? status : undefined,
        },
        withCredentials: true,
      },
    );
  }

  getRegistrationById(id: number) {
    return axios.get<RegistrationDetailDTO>(`${API_BASE_URL}/${id}`, {
      withCredentials: true,
    });
  }

  submitRegistration(data: FullRegistrationDTO) {
    return axios.post<RegistrationSummaryDTO>(`${API_BASE_URL}/submit`, data, {
      withCredentials: true,
    });
  }

  approveRegistration(id: number) {
    return axios.post<MessageResponse>(`${API_BASE_URL}/${id}/approve`, null, {
      withCredentials: true,
    });
  }

  rejectRegistration(id: number, note?: string) {
    return axios.post<MessageResponse>(`${API_BASE_URL}/${id}/reject`, null, {
      params: {
        note: note?.trim() || undefined,
      },
      withCredentials: true,
    });
  }
}

export default new RegistrationService();
