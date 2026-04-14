import { Position } from "./position.type";

export interface User {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
  avatar?: string | null;
  position?: Position;
  yearOfExperience: number;
  skills?: string[];
  name?: string | null;
  createdAt: Date;
}
