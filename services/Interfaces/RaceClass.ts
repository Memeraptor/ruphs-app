import Class from "./Class";
import Race from "./Race";

export default interface RaceClass {
  id: number;
  classId: number;
  raceId: number;
  race: Race;
  class: Class;
}
