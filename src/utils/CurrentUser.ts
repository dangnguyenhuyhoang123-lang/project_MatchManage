import type { AuthUser } from "../types/AuthUser";

const STORAGE_KEY = "current_user";

let memoryUser: AuthUser | null = null;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredUser(): AuthUser | null {
  if (!canUseStorage()) return memoryUser;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

const CurrentUser = {
  getUser(): AuthUser | null {
    if (memoryUser) return memoryUser;

    const storedUser = readStoredUser();
    memoryUser = storedUser;
    return storedUser;
  },

  setUser(user: AuthUser | null) {
    memoryUser = user;

    if (!canUseStorage()) return;

    if (!user) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  clear() {
    this.setUser(null);
  },

  getId() {
    return this.getUser()?.id;
  },

  getUsername() {
    return this.getUser()?.username ?? "";
  },

  getRoles() {
    return this.getUser()?.roles ?? [];
  },

  getFullName() {
    return this.getUser()?.fullName ?? this.getUser()?.displayName ?? "";
  },

  getEmail() {
    return this.getUser()?.email ?? "";
  },

  getPhone() {
    return this.getUser()?.phone ?? "";
  },

  getAvatar() {
    return this.getUser()?.avatar ?? "";
  },

  getTeamId() {
    return this.getUser()?.teamId;
  },

  hasRole(role: string) {
    return this.getRoles().includes(role);
  },

  hasAnyRole(roles: string[]) {
    return roles.some((role) => this.getRoles().includes(role));
  },
};

export default CurrentUser;
