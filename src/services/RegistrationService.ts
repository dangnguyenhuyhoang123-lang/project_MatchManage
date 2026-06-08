import axiosClient from "./axiosClient";
import type {
  AdminUpdateRegistrationPayload,
  FullRegistrationDTO,
  MessageResponse,
  RegistrationDetailDTO,
  RegistrationStatus,
  RegistrationSummaryDTO,
} from "../model/Registration";

const API_BASE_URL = "/registrations";

class RegistrationService {
  // Gọi API lấy registrations.
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

  // Gọi API lấy registration by id.
  getRegistrationById(id: number) {
    return axiosClient.get<RegistrationDetailDTO>(`${API_BASE_URL}/${id}`, {
      withCredentials: true,
    });
  }

  markRegistrationPaid(id: number, paymentProofUrl?: string) {
    return axiosClient.patch(`${API_BASE_URL}/${id}/payment`, null, {
      params: {
        paymentProofUrl: paymentProofUrl?.trim() || undefined,
      },
      withCredentials: true,
    });
  }

  // Gọi API tạo registration.
  submitRegistration(data: FullRegistrationDTO) {
    return axiosClient.post<RegistrationSummaryDTO>(
      `${API_BASE_URL}/submit`,
      data,
      {
        withCredentials: true,
      },
    );
  }

  updateRegistrationByAdmin(
    id: number,
    data: AdminUpdateRegistrationPayload,
  ) {
    return axiosClient.put<RegistrationDetailDTO>(`${API_BASE_URL}/${id}`, data, {
      withCredentials: true,
    });
  }

  approveRegistration(id: number) {
    return axiosClient.post<MessageResponse>(
      `${API_BASE_URL}/${id}/approve`,
      null,
      {
        withCredentials: true,
      },
    );
  }

  rejectRegistration(id: number, note?: string) {
    return axiosClient.post<MessageResponse>(
      `${API_BASE_URL}/${id}/reject`,
      null,
      {
        params: {
          note: note?.trim() || undefined,
        },
        withCredentials: true,
      },
    );
  }

  deleteRegistration(id: number) {
    return axiosClient.delete<MessageResponse>(`${API_BASE_URL}/${id}`, {
      withCredentials: true,
    });
  }
}

export default new RegistrationService();
