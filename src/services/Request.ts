import axiosClient from "./axiosClient";

export async function my_request<T = any>(url: string): Promise<T> {
  const response = await axiosClient.get<T>(url);

  return response.data;
}
