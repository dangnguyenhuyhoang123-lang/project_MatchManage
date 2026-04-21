export class PlayerInLineup {
  id!: number;
  playerName!: string;
  shirtNumber!: number;
  position!: string;
  teamName!: string;
  avatar!: string;
  isStarting!: boolean;
  lineupOrder!: number;
  role!: string | null;

  constructor(data?: Partial<PlayerInLineup>) {
    Object.assign(this, data);
  }
}
