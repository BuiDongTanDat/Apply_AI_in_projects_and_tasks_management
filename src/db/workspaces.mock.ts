import { mockUsers } from "./users.mock";
import { mockTeams } from "./team.mock";
import { mockProjects } from "./projects.mock";

export const mockWorkspaces = [
  {
    id: "w1",
    name: "Workspace Alpha",
    imagePath: "",
    description: "Workspace for Alpha projects",
    invitationLink: "https://app.risefe.com/invite/w1",
    teams: [mockTeams[0], mockTeams[1]],
    users: [mockUsers[0], mockUsers[1], mockUsers[2]],
    members: [
      { id: mockUsers[0].id, avatar: mockUsers[0].avatarPath },
      { id: mockUsers[1].id, avatar: mockUsers[1].avatarPath },
      { id: mockUsers[2].id, avatar: mockUsers[2].avatarPath }
    ],
    projects: [mockProjects[0], mockProjects[1]]
  },
  {
    id: "w2",
    name: "Workspace Beta",
    imagePath: "",
    description: "Workspace for Beta team",
    invitationLink: "https://app.risefe.com/invite/w2",
    teams: [mockTeams[2]],
    users: [mockUsers[2], mockUsers[3]],
    members: [
      { id: mockUsers[2].id, avatar: mockUsers[2].avatarPath },
      { id: mockUsers[3].id, avatar: mockUsers[3].avatarPath }
    ],
    projects: [mockProjects[2]]
  },
  {
    id: "w3",
    name: "Workspace Gamma",
    imagePath: "",
    description: "Workspace for Gamma team",
    invitationLink: "https://app.risefe.com/invite/w3",
    teams: [mockTeams[3]],
    users: [mockUsers[0], mockUsers[3]],
    members: [
      { id: mockUsers[0].id, avatar: mockUsers[0].avatarPath },
      { id: mockUsers[3].id, avatar: mockUsers[3].avatarPath }
    ],
    projects: [mockProjects[3], mockProjects[4]]
  },
  {
    id: "w4",
    name: "Workspace Delta",
    imagePath: "",
    description: "Workspace for Delta team",
    invitationLink: "https://app.risefe.com/invite/w4",
    teams: [],
    users: [mockUsers[1]],
    members: [
      { id: mockUsers[1].id, avatar: mockUsers[1].avatarPath }
    ],
    projects: []
  },
  {
    id: "w5",
    name: "Workspace Delta",
    imagePath: "",
    description: "Workspace for Delta team",
    invitationLink: "https://app.risefe.com/invite/w4",
    teams: [],
    users: [mockUsers[1]],
    members: [
      { id: mockUsers[1].id, avatar: mockUsers[1].avatarPath }
    ],
    projects: []
  },
  {
    id: "w6",
    name: "Workspace Delta",
    imagePath: "",
    description: "Workspace for Delta team",
    invitationLink: "https://app.risefe.com/invite/w4",
    teams: [],
    users: [mockUsers[1]],
    members: [
      { id: mockUsers[1].id, avatar: mockUsers[1].avatarPath }
    ],
    projects: []
  },
  {
    id: "w7",
    name: "Workspace Delta",
    imagePath: "",
    description: "Workspace for Delta team",
    invitationLink: "https://app.risefe.com/invite/w4",
    teams: [],
    users: [mockUsers[1]],
    members: [
      { id: mockUsers[1].id, avatar: mockUsers[1].avatarPath }
    ],
    projects: []
  },
  {
    id: "w8",
    name: "Workspace Delta",
    imagePath: "",
    description: "Workspace for Delta team",
    invitationLink: "https://app.risefe.com/invite/w4",
    teams: [],
    users: [mockUsers[1]],
    members: [
      { id: mockUsers[1].id, avatar: mockUsers[1].avatarPath }
    ],
    projects: []
  },
  {
    id: "w9",
    name: "Workspace Delta",
    imagePath: "",
    description: "Workspace for Delta team",
    invitationLink: "https://app.risefe.com/invite/w4",
    teams: [],
    users: [mockUsers[1]],
    members: [
      { id: mockUsers[1].id, avatar: mockUsers[1].avatarPath }
    ],
    projects: []
  },
  {
    id: "w10",
    name: "Workspace Delta",
    imagePath: "",
    description: "Workspace for Delta team",
    invitationLink: "https://app.risefe.com/invite/w4",
    teams: [],
    users: [mockUsers[1]],
    members: [
      { id: mockUsers[1].id, avatar: mockUsers[1].avatarPath }
    ],
    projects: []
  }
];

export const otherWorkspaces = [
  {
    id: "ow1",
    name: "Other Workspace 1",
    imagePath: "",
    description: "Other workspace 1 description...",
    invitationLink: "https://app.risefe.com/invite/ow1",
    teams: [mockTeams[0]],
    users: [mockUsers[1], mockUsers[2]],
    members: [
      { id: mockUsers[1].id, avatar: mockUsers[1].avatarPath },
      { id: mockUsers[2].id, avatar: mockUsers[2].avatarPath }
    ],
    projects: [mockProjects[2]]
  },
  {
    id: "ow2",
    name: "Other Workspace 2",
    imagePath: "",
    description: "Other workspace 2 description...",
    invitationLink: "https://app.risefe.com/invite/ow2",
    teams: [mockTeams[1]],
    users: [mockUsers[0], mockUsers[3]],
    members: [
      { id: mockUsers[0].id, avatar: mockUsers[0].avatarPath },
      { id: mockUsers[3].id, avatar: mockUsers[3].avatarPath }
    ],
    projects: [mockProjects[3]]
  },
  {
    id: "ow3",
    name: "Other Workspace 3",
    imagePath: "",
    description: "Other workspace 3 description...",
    invitationLink: "https://app.risefe.com/invite/ow3",
    teams: [],
    users: [mockUsers[2]],
    members: [
      { id: mockUsers[2].id, avatar: mockUsers[2].avatarPath }
    ],
    projects: []
  },
  {
    id: "ow4",
    name: "Other Workspace 4",
    imagePath: "",
    description: "Other workspace 4 description...",
    invitationLink: "https://app.risefe.com/invite/ow4",
    teams: [mockTeams[2], mockTeams[3]],
    users: [mockUsers[1], mockUsers[3]],
    members: [
      { id: mockUsers[1].id, avatar: mockUsers[1].avatarPath },
      { id: mockUsers[3].id, avatar: mockUsers[3].avatarPath }
    ],
    projects: [mockProjects[4]]
  }
];