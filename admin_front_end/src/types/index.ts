export interface Departement {
  id: number;
  name: string;
  chef: User;
  depart_type: string;
  status: STATUS;
}

interface Restriction {
  id: number;
  user: User;
  departement: Departement;
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
  solde: number;
  role: ROLE;
  activity: USER_STATUS;
  access_entity: number[];
  access_entity_hr: number[];
  access_team: number[];
  access_planning_teams: number[];
  restrictions: Restriction[];
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

export interface Entity {
  id: number;
  name: string;
  chef: User;
  status: STATUS;
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
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: number;
  from: User;
  to: User;
  subject: string;
  updatedby: User;
  status: TOPIC_STATUS;
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

export interface Tool {
  id: number;
  tool: string;
  name: string;
  server: string;
  port: number;
  password: string;
  api_link: string;
  logs: string;
  active: boolean;
  deploying: boolean;
  entity: Entity;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  from: User;
  to: User;
  msg: string;
  topic: Topic;
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

export interface ApiUser {
  uid: number;
  fname: string;
  lname: string;
  email: string;
}

export enum TICKET_STATUS {
  Open = "OPEN",
  In_Progress = "IN PROGRESS",
  Resolved = "RESOLVED",
  Reopened = "REOPENED",
  Closed = "CLOSED",
}

export enum TOPIC_STATUS {
  COMPLETED = "COMPLETED",
  OPEN = "OPEN",
}

export enum TICKET_SEVERITY {
  CRITICAL = "CRITICAL",
  MAJOR = "MAJOR",
  MINOR = "MINOR",
}

export enum STATUS {
  Active = "active",
  Inactive = "inactive",
}

export enum ROLE {
  CHEF = "CHEF",
  TEAMLEADER = "TEAMLEADER",
  TEAMMEMBER = "TEAMMEMBER",
  ADMIN = "ADMINISTRATION",
}

export interface GlobalState {
  isAuthenticated: boolean;
  user: User | undefined;
}

interface Filter {
  id: number;
  user: number;
  assigned_to: number;
  related_ressource: string;
  entity: number;
  issuer_team: number;
  departement: number;
  target_team: number;
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
  sortOrder: string;
  sortField: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  read: number;
}

export enum TOOLS {
  SPF = "spf",
  OFFICE = "office",
}

export enum USER_STATUS {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  AWAY = "AWAY",
}
export interface Session {
  id: number;
  token: number;
  active: boolean;
  ll: number[];
  iphistory: string[];
  ip: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  id: number;
  user: User;
  from: string;
  to: string;
  notes: string;
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
