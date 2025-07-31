import { Race, Specialization } from "@prisma/client";

export default interface Character {
  id: number;
  name: string;
  level: number;
  gender: "male" | "female";
  note: string;
  race: Race;
  specialization: Specialization;
}
