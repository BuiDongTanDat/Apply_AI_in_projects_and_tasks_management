
import { mockUsers } from "./users.mock";

export const mockTeams = [
  {
    id: "t1",
    name: "Frontend Team",
    description: "Responsible for UI/UX",
    createdAt: new Date("2023-01-01"),
    users: [mockUsers[0], mockUsers[1]],
    owner: mockUsers[0],
    icon: undefined
  },
  {
    id: "t2",
    name: "Backend Team",
    description: "API and Database",
    createdAt: new Date("2023-01-02"),
    users: [mockUsers[1], mockUsers[3]],
    owner: mockUsers[3],
    icon: undefined
  },
  {
    id: "t3",
    name: "QA Team",
    description: "Testing and QA",
    createdAt: new Date("2023-01-03"),
    users: [mockUsers[2]],
    owner: mockUsers[2],
    icon: undefined
  },
  {
    id: "t4",
    name: "DevOps Team",
    description: "Deployment and CI/CD",
    createdAt: new Date("2023-01-04"),
    users: [mockUsers[0], mockUsers[2], mockUsers[3]],
    owner: mockUsers[0],
    icon: undefined
  }
];