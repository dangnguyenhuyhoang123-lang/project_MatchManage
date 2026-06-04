import axiosClient from "./axiosClient";

const API_BASE_URL = "/referees";

export type RefereeStatus = "ACTIVE" | "INACTIVE";

export type Referee = {
  id: number;
  name: string;
  dateOfBirth?: string | null;
  birthYear?: number | null;
  nationality?: string | null;
  phone?: string | null;
  email?: string | null;
  level?: string | null;
  certification?: string | null;
  avatar?: string | null;
  status?: RefereeStatus | string | null;
  note?: string | null;
};

export type RefereeRequest = Omit<Referee, "id">;

class RefereeService {
  getAll() {
    return axiosClient.get<Referee[]>(API_BASE_URL);
  }

  getById(id: number) {
    return axiosClient.get<Referee>(`${API_BASE_URL}/${id}`);
  }

  create(payload: RefereeRequest) {
    return axiosClient.post<Referee>(API_BASE_URL, payload);
  }

  update(id: number, payload: RefereeRequest) {
    return axiosClient.put<Referee>(`${API_BASE_URL}/${id}`, payload);
  }

  remove(id: number) {
    return axiosClient.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new RefereeService();
