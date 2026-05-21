export type AuthUser = {
  id?: number;
  username: string;
  roles: string[];
  fullName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  teamId?: number;
};
