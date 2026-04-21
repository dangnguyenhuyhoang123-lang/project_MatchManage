export class SeasonModel {
  id?: number;
  year: string;

  constructor({ id, year = "" }: { id?: number; year?: string }) {
    this.id = id;
    this.year = year;
  }
}
