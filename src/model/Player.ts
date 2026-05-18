export type PlayerStatus = "ACTIVE" | "INJURED" | "SUSPENDED" | string;

export class Player {
  id?: number;
  name: string;
  idCode: string | null;
  dateOfBirth: string;
  position: string;
  detailPosition: string | null;
  shirtNumber: number;
  nationality: string;
  height: number;
  weight: number;
  status: PlayerStatus;
  avatar: string | null;
  teamId: number | null;
  teamName: string | null;

  constructor(data: Partial<Player> = {}) {
    this.id = data.id;
    this.name = data.name ?? "";
    this.idCode = data.idCode ?? null;
    this.dateOfBirth = data.dateOfBirth ?? "";
    this.position = data.position ?? "";
    this.detailPosition = data.detailPosition ?? null;
    this.shirtNumber = data.shirtNumber ?? 0;
    this.nationality = data.nationality ?? "Việt Nam";
    this.height = data.height ?? 170;
    this.weight = data.weight ?? 65;
    this.status = data.status ?? "ACTIVE";
    this.avatar = data.avatar ?? null;
    this.teamId = data.teamId ?? null;
    this.teamName = data.teamName ?? null;
  }
}
