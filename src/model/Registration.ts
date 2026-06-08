export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type FeeStatus = "UNPAID" | "PAID" | "WAIVED";
export type GrassType = "Standard" | "Synthetic" | "Premium";

export interface TeamRegistrationDTO {
  id: number;
  note?: string | null;

  homeKitColor?: string | null;
  awayKitColor?: string | null;
  homeKitImageUrl?: string | null;
  awayKitImageUrl?: string | null;
}

export interface StadiumRegistrationDTO {
  name: string;
  address: string;
  capacity: number;
  grass: GrassType;

  country: string;
  fifaStarRating: number;
  certificateUrl?: string | null;
}

export interface PlayerRegistrationDTO {
  playerId: number;
  shirtNumber: number;
  position: string;
}

export interface CoachRegistrationDTO {
  coachId: number;
  role: string;
}

export interface AdminUpdateRegistrationPayload {
  teamInfo: TeamRegistrationDTO;
  listPlayerInfo: PlayerRegistrationDTO[];
  listCoachInfo: CoachRegistrationDTO[];
}

export interface FullRegistrationDTO {
  seasonID: number;
  teamInfo: TeamRegistrationDTO;
  stadiumInfo: StadiumRegistrationDTO;
  listPlayerInfo: PlayerRegistrationDTO[];
  listCoachInfo: CoachRegistrationDTO[];
}

export interface RegistrationSummaryDTO {
  id: number;
  seasonId: number;
  clubId?: number;
  seasonName: string;
  teamId?: number;
  teamName: string;
  city: string;
  status: RegistrationStatus;
  playerCount: number;
  coachCount: number;
  submittedAt: string;
  note?: string;

  feeAmount?: number | null;
  feeStatus?: FeeStatus | null;
  paymentProofUrl?: string | null;
  paidAt?: string | null;
}

export interface RegistrationPlayerViewDTO {
  playerId?: number;
  name: string;
  idCode: string;
  IDCode?: string;
  dateOfBirth: string;
  position: string;
  shirtNumber: number;
  nationality: string;
  height: number;
  weight: number;
  official: boolean;
}

export interface RegistrationCoachViewDTO {
  coachId?: number;
  name: string;
  nationality: string;
  idCode: string;
  IDCode?: string;
  birthDay: string;
  role: string;
  tournamentRole?: string;
  description?: string;
  des?: string;
}

export interface RegistrationDetailDTO {
  id: number;
  seasonId: number;
  teamId?: number | null;
  clubId?: number;
  team?: {
    id?: number;
    teamId?: number;
    name?: string;
  };
  club?: {
    id?: number;
    clubId?: number;
    name?: string;
  };
  seasonName: string;
  teamName: string;
  logo?: string;
  establishedYear?: number;
  city?: string;
  region?: string;
  owner?: string;
  description?: string;

  stadiumName: string;
  stadiumAddress: string;
  stadiumCapacity: number;
  stadiumGrass: GrassType;
  stadiumCountry?: string | null;
  fifaStarRating?: number | null;
  certificateUrl?: string | null;

  homeKitColor?: string | null;
  awayKitColor?: string | null;
  homeKitImageUrl?: string | null;
  awayKitImageUrl?: string | null;

  feeAmount?: number | null;
  feeStatus?: FeeStatus | null;
  paymentProofUrl?: string | null;
  paidAt?: string | null;

  status: RegistrationStatus;
  note?: string;
  submittedAt: string;
  players: RegistrationPlayerViewDTO[];
  coaches: RegistrationCoachViewDTO[];
}

export interface MessageResponse {
  message: string;
}
