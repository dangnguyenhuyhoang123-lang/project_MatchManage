export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type GrassType = "Standard" | "Synthetic" | "Premium";

export interface TeamRegistrationDTO {
  id: number;
  note?: string;
}

export interface StadiumRegistrationDTO {
  name: string;
  address: string;
  capacity: number;
  grass: GrassType;
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
  status: RegistrationStatus;
  note?: string;
  submittedAt: string;
  players: RegistrationPlayerViewDTO[];
  coaches: RegistrationCoachViewDTO[];
}

export interface MessageResponse {
  message: string;
}
