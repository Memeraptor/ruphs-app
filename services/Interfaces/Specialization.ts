import { Character } from "@prisma/client";
import Class from "./Classes";

export default interface Specialization {
  id: string;
  name: string;
  slug: string;
  classId: number;
  class: Class;
  characters: Character[];
}
