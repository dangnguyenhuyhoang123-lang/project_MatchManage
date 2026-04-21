export class League {
  id?: number;
  name: string;
  country: string;
  logo: string;

  constructor({
    id,
    name = "",
    country = "",
    logo = "",
  }: {
    id?: number;
    name?: string;
    country?: string;
    logo?: string;
  } = {}) {
    this.id = id;
    this.name = name;
    this.country = country;
    this.logo = logo;
  }
}
