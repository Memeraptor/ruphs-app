import RaceClass from "./RaceClass";
import Specialization from "./Specialization";

export default interface Class {
  id: number;
  name: string;
  slug: string;
  armorType: string;
  colorCode: string;
  races?: RaceClass[];
  specializations?: Specialization[];
}
