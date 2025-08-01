import Class from "./Class";

export default interface Specialization {
  id: number;
  name: string;
  slug: string;
  class?: Class;
  classId: number;
}
