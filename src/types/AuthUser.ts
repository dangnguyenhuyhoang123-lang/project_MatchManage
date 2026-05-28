export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  username: string;
  displayName?: string;
  phone?: string;
  avatar?: string;
  status: boolean;
  roles: string[];
  teamId?: number | null;
};
