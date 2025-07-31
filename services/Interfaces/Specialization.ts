import Class from "./Class";

export default interface Specialization {
  id: string;
  name: string;
  slug: string;
  class: Class;
  classId: number;
}
