import axiosClient from "./axiosClient";
import type {
  FullRegistrationDTO,
  MessageResponse,
  RegistrationDetailDTO,
  RegistrationStatus,
  RegistrationSummaryDTO,
} from "../model/Registration";

const API_BASE_URL = "/registrations";

class RegistrationService {
  getAllRegistrations(status?: RegistrationStatus | "Tất cả") {
    return axiosClient.get<RegistrationSummaryDTO[]>(
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
    return axiosClient.get<RegistrationDetailDTO>(`${API_BASE_URL}/${id}`, {
      withCredentials: true,
    });
  }

  submitRegistration(data: FullRegistrationDTO) {
    return axiosClient.post<RegistrationSummaryDTO>(`${API_BASE_URL}/submit`, data, {
      withCredentials: true,
    });
  }

  approveRegistration(id: number) {
    return axiosClient.post<MessageResponse>(`${API_BASE_URL}/${id}/approve`, null, {
      withCredentials: true,
    });
  }

  rejectRegistration(id: number, note?: string) {
    return axiosClient.post<MessageResponse>(`${API_BASE_URL}/${id}/reject`, null, {
      params: {
        note: note?.trim() || undefined,
      },
      withCredentials: true,
    });
  }
}

export default new RegistrationService();
