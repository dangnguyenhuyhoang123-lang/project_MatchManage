export type RealtimeAction =
  | "REFETCH_MATCHES"
  | "REFETCH_MATCH_DETAIL"
  | "REFETCH_MATCH_EVENTS"
  | "REFETCH_MATCH_STATS"
  | "REFETCH_LINEUPS"
  | "REFETCH_STANDINGS"
  | "REFETCH_REGISTRATIONS"
  | "REFETCH_TEAM_SEASON"
  | "REFETCH_TEAM_STATS"
  | "REFETCH_INVITATIONS"
  | "REFETCH_SEASON_TEAMS"
  | "REFETCH_LEAGUES"
  | "REFETCH_SEASONS"
  | "REFETCH_ROUNDS"
  | "REFETCH_MATCH_REFEREES"
  | "REFETCH_NEWS"
  | "REFETCH_USERS"
  | "REFETCH_SYSTEM_RULES"
  | "REFETCH_PLAYERS"
  | "REFETCH_COACHES"
  | "REFETCH_TEAMS"
  | "REFETCH_STADIUMS";

export type RealtimeEventDTO = {
  type: string;
  referenceId?: number | null;
  referenceType?: string | null;
  action?: RealtimeAction | string | null;
  message?: string | null;
  createdAt?: string | null;
  payload?: unknown;
};

export type NotificationDTO = {
  id?: number;
  title?: string;
  message?: string;
  type?: string;
  referenceId?: number | null;
  referenceType?: string | null;
  read?: boolean;
  createdAt?: string | null;
  content?: string;
  isRead?: boolean;
  receiverId?: number;
};
