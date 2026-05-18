export class League {
  id?: number;
  name: string;
  country: string;
  scale: string;
  status: string;
  logo: string | null;

  constructor(data: Partial<League> = {}) {
    this.id = data.id;
    this.name = data.name ?? "";
    this.country = data.country ?? "";
    this.scale = data.scale ?? "";
    this.status = data.status ?? "ACTIVE";
    this.logo = data.logo ?? null;
  }
}
