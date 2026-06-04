export class SeasonModel {
  id?: number;
  year: string;
  name: string;
  leagueName: string | null;

  constructor({
    id,
    year = "",
    name = "",
    leagueName = null,
  }: {
    id?: number;
    year?: string;
    name?: string;
    leagueName?: string | null;
  }) {
    this.id = id;
    this.year = year;
    this.name = name;
    this.leagueName = leagueName;
  }

  get displayName() {
    return this.name || this.year || `Mùa giải #${this.id ?? ""}`.trim();
  }
}
