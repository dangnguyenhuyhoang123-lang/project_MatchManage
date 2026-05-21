import CurrentUser from "./CurrentUser";

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Admin",
  ADMIN: "Admin",
  ROLE_STAFF: "Staff",
  STAFF: "Staff",
  ROLE_CLUB_MANAGER: "Quản lý CLB",
  CLUB_MANAGER: "Quản lý CLB",
  ROLE_USER: "Người dùng",
  USER: "Người dùng",
};

const UserInfo = {
  getUser: () => CurrentUser.getUser(),

  getId: () => CurrentUser.getId(),

  getUsername: () => CurrentUser.getUsername(),

  getFullName: () => CurrentUser.getFullName(),

  getDisplayName: () => {
    const user = CurrentUser.getUser();
    return (
      user?.displayName ||
      user?.fullName ||
      user?.username ||
      ""
    );
  },

  getEmail: () => CurrentUser.getEmail(),

  getPhone: () => CurrentUser.getPhone(),

  getAvatar: () => CurrentUser.getAvatar(),

  getTeamId: () => CurrentUser.getTeamId(),

  getRoles: () => CurrentUser.getRoles(),

  getPrimaryRole: () => {
    const roles = CurrentUser.getRoles();
    return roles[0] || "";
  },

  getRoleLabel: () => {
    const roles = CurrentUser.getRoles();
    return roles.map((role) => ROLE_LABELS[role]).find(Boolean) || "Người dùng";
  },

  hasRole: (role: string) => CurrentUser.hasRole(role),

  hasAnyRole: (roles: string[]) => CurrentUser.hasAnyRole(roles),

  isAdmin: () =>
    CurrentUser.hasAnyRole(["ROLE_ADMIN", "ADMIN"]),

  isStaff: () =>
    CurrentUser.hasAnyRole(["ROLE_STAFF", "STAFF"]),

  isClubManager: () =>
    CurrentUser.hasAnyRole(["ROLE_CLUB_MANAGER", "CLUB_MANAGER"]),

  isLoggedIn: () => Boolean(CurrentUser.getUser()),
};

export default UserInfo;
