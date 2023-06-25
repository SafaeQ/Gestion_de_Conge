export interface Departement {
  id: number;
  name: string;
  chef: User;
  depart_type: string;
  status: STATUS;
}

export interface User {
  id: number;
  name: string;
  username: string;
  departements: Departement[];
  entity: Entity;
  team: Team;
  user_type: string;
  status: STATUS;
  role: ROLE;
  solde: number;
  holidays: Holiday[];
  activity: USER_STATUS;
  unreadMessages?: number;
  access_entity: number[];
  access_team: number[];
  access_planning_teams: number[];
  access_entity_hr: number[];
}

export interface Entity {
  id: number;
  name: string;
  chef: User;
  status: STATUS;
  createdAt: string;
  updatedAt: string;
}

export interface Sponsor {
  id: number;
  name: string;
  login_link: string;
  home_link: string;
  login_selector: string;
  password_selector: string;
  submit_selector: string;
  username: string;
  password: string;
  status: string;
  entities: Entity[];
  restricted_pages: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  color: string;
  id: number;
  name: string;
  leader: User;
  departement: Departement;
  status: STATUS;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: number;
  user: User;
  subject: string;
  assigned_to: User;
  closed_by: string;
  resolved_by: string;
  pinned: boolean;
  related_ressource: string;
  entity: Entity;
  issuer_team: Team;
  departement: Departement;
  target_team: Team;
  severity: TICKET_SEVERITY;
  last_update: string;
  status: TICKET_STATUS;
  unread: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: number;
  user: User;
  ticket: Ticket;
  body: string;
  read: number[];
  createdAt: string;
  updatedAt: string;
}

export interface Complaints {
  id: number;
  user: User;
  subject: string;
  message: string;
  seen: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum TICKET_STATUS {
  Open = "OPEN",
  In_Progress = "IN PROGRESS",
  Resolved = "RESOLVED",
  Reopened = "REOPENED",
  Closed = "CLOSED",
}

export enum TICKET_SEVERITY {
  CRITICAL = "CRITICAL",
  MAJOR = "MAJOR",
  MINOR = "MINOR",
}
enum STATUS {
  Active = "active",
  Inactive = "inactive",
}

export enum ROLE {
  CHEF = "CHEF",
  TEAMLEADER = "TEAMLEADER",
  TEAMMEMBER = "TEAMMEMBER",
  ADMIN = "ADMINISTRATION",
}

export enum USER_STATUS {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  AWAY = "AWAY",
}

export interface GlobalState {
  isAuthenticated: boolean;
  user: User;
}

interface Filter {
  id: number;
  user: {
    id: number;
  };
  assigned_to: {
    id: number;
  };
  related_ressource: string;
  entity: {
    id: number;
  };
  issuer_team: {
    departement?: number[];
    id?: number;
  };
  departement: [string, number[]];
  target_team:
    | {
        id: number;
      }
    | [string, number[]];
  severity: TICKET_SEVERITY;
  last_update: string;
  status: TICKET_STATUS;
  createdAt: string;
  updatedAt: string;
}

export interface IqueryParams {
  filter: Partial<Filter>;
  access_entity: number[];
  access_team: number[];
  assigned_to?: number | null;
  sortOrder: string;
  typeUser?: string | undefined;
  sortField: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  read: number;
}

export interface ChatState {
  loader: boolean;
  userNotFound: string;
  drawerState: boolean;
  selectedSectionId: number;
  selectedTabIndex: number;
  selectedTopic: null;
}

export interface Chat {
  id: number;
  from: User;
  to: User;
  msg: string;
  read: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: number;
  from: User;
  to: User;
  updatedby: User | null;
  status: TopicStatus;
  subject: string;
  createdAt: string;
  updatedAt: string;
  unreadMessages: number;
}

export interface Holiday {
  id: number;
  user: User;
  from: string;
  to: string;
  notes: string;
  createdBy: string;
  isOkByChef: boolean;
  isOkByHr: boolean;
  isRejectByChef: boolean;
  isRejectByHr: boolean;
  status: REQUEST_HOLIDAY_STATUS;
  createdAt: string;
  updatedAt: string;
  unreadMessages: number;
}

export interface DaysOff {
  id: number;
  date: string;
  name: string;
}

export enum REQUEST_HOLIDAY_STATUS {
  Open = "OPEN",
  Approve = "APPROVE",
  Reject = "REJECT",
  Cancel = "CANCEL",
}

export enum TopicStatus {
  OPEN = "OPEN",
  COMPLETED = "COMPLETED",
}
