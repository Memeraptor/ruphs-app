import Class from "./Class";

export default interface Specialization {
  id: string;
  name: string;
  slug: string;
  classId: number;
  class: Class;
}
