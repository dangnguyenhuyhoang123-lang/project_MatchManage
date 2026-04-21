export class Player {
  avatar: string;
  id: number;
  name: string;
  number: number;
  position: string;

  constructor(data?: Partial<Player>) {
    this.id = data?.id ?? 0;
    this.name = data?.name ?? "";
    this.number = data?.number ?? 0;
    this.position = data?.position ?? "";
    this.avatar = data?.avatar ?? "";
  }
}
