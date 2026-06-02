export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type FeeStatus = "UNPAID" | "PAID" | "WAIVED";
export type GrassType = "Standard" | "Synthetic" | "Premium";

export interface TeamRegistrationDTO {
  id: number;
  note?: string;

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
  seasonName: string;
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
  name: string;
  idCode: string;
  dateOfBirth: string;
  position: string;
  shirtNumber: number;
  nationality: string;
  height: number;
  weight: number;
  official: boolean;
}

export interface RegistrationCoachViewDTO {
  name: string;
  nationality: string;
  idCode: string;
  birthDay: string;
  role: string;
  description?: string;
}

export interface RegistrationDetailDTO {
  id: number;
  seasonId: number;
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
