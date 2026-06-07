import type { AuthUser } from "../types/AuthUser";

const STORAGE_KEY = "current_user";

let memoryUser: AuthUser | null = null;

type RawAuthUser = AuthUser & {
  teamId?: number | string | null;
  team_id?: number | string | null;
  clubId?: number | string | null;
  team?: {
    id?: number | string | null;
    teamId?: number | string | null;
  } | null;
};

// Xử lý can use storage.
function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

// Xử lý stored user.
function readStoredUser(): AuthUser | null {
  if (!canUseStorage()) return memoryUser;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return normalizeAuthUser(JSON.parse(raw) as AuthUser);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

// Xử lý positive id.
function toPositiveId(value: unknown) {
  const id = Number(value);

  return Number.isFinite(id) && id > 0 ? id : undefined;
}

// Chuẩn hóa auth user.
function normalizeAuthUser(user: AuthUser): AuthUser {
  const rawUser = user as RawAuthUser;
  const teamId =
    toPositiveId(rawUser.teamId) ??
    toPositiveId(rawUser.team_id) ??
    toPositiveId(rawUser.clubId) ??
    toPositiveId(rawUser.team?.id) ??
    toPositiveId(rawUser.team?.teamId);

  return {
    ...user,
    ...(teamId ? { teamId } : {}),
  };
}

const CurrentUser = {
  // Lấy user.
  getUser(): AuthUser | null {
    if (memoryUser) return memoryUser;

    const storedUser = readStoredUser();
    memoryUser = storedUser;
    return storedUser;
  },

  setUser(user: AuthUser | null) {
    const normalizedUser = user ? normalizeAuthUser(user) : null;

    memoryUser = normalizedUser;

    if (!canUseStorage()) return;

    if (!normalizedUser) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
  },

  clear() {
    this.setUser(null);
  },

  // Lấy id.
  getId() {
    return this.getUser()?.id;
  },

  // Lấy username.
  getUsername() {
    return this.getUser()?.username ?? "";
  },

  // Lấy roles.
  getRoles() {
    return this.getUser()?.roles ?? [];
  },

  // Lấy full name.
  getFullName() {
    return this.getUser()?.fullName ?? this.getUser()?.displayName ?? "";
  },

  // Lấy email.
  getEmail() {
    return this.getUser()?.email ?? "";
  },

  // Lấy phone.
  getPhone() {
    return this.getUser()?.phone ?? "";
  },

  // Lấy avatar.
  getAvatar() {
    return this.getUser()?.avatar ?? "";
  },

  // Lấy team id.
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
