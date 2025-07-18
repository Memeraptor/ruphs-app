import Race from "./Race";

export default interface Character {
  id: number;
  name: string;
  level: number;
  race: Race;
  specializationId: number;
}
