import { Faction } from "@prisma/client";

export default interface Race {
  id: number;
  name: string;
  slug: string;
  factionId: number;
  faction?: Faction;
}
