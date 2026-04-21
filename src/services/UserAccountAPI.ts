import type { User } from "../utils/AuthContext";

const API_BASE_URL = "http://localhost:8080/api/user-account";

export type UpdateProfilePayload = {
  username: string;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
};

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Khong the tai thong tin nguoi dung.");
  }

  return (await response.json()) as User;
}

export async function updateCurrentUserProfile(payload: UpdateProfilePayload) {
  const endpoints = [
    { url: `${API_BASE_URL}/me`, method: "PUT" },
    { url: `${API_BASE_URL}/profile`, method: "PUT" },
    { url: `${API_BASE_URL}/me`, method: "PATCH" },
    { url: `${API_BASE_URL}/profile`, method: "PATCH" },
  ] as const;

  let lastErrorMessage = "Khong the cap nhat thong tin nguoi dung.";

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      try {
        return (await response.json()) as User;
      } catch {
        return getCurrentUser();
      }
    }

    try {
      const errorData = await response.json();
      lastErrorMessage = errorData.message || lastErrorMessage;
    } catch {
      if (response.status !== 404) {
        lastErrorMessage = response.statusText || lastErrorMessage;
      }
    }
  }

  throw new Error(lastErrorMessage);
}
