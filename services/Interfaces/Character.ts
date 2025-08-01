import Race from "./Race";
import Specialization from "./Specialization";

export default interface Character {
  id: number;
  name: string;
  level: number;
  gender: "male" | "female";
  note: string;
  raceId: number; // Keep these if CharacterBadge needs to know the original IDs
  specializationId: number; // Keep these if CharacterBadge needs to know the original IDs
  race?: Race; // This can be undefined if lookup failed
  specialization?: Specialization; // This can be undefined if lookup failed
}
