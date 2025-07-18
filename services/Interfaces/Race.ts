export default interface Race {
  id: number;
  name: string;
  slug: string;
  factionId: number;
  faction: {
    id: number;
    name: string;
  };
}
