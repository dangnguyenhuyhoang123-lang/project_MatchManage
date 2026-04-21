export class Coach {
  id?: number;
  name: string;
  nationality: string;
  logo: string;

  constructor({
    id,
    name = "",
    nationality = "",
    logo = "",
  }: {
    id?: number;
    name?: string;
    nationality?: string;
    logo?: string;
  } = {}) {
    this.id = id;
    this.name = name;
    this.nationality = nationality;
    this.logo = logo;
  }
}
