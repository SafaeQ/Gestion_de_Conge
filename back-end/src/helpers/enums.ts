export interface IqueryParams<T> {
  filter: T;
  access_entity: number[];
  access_team: number[];
  status: TICKET_STATUS;
  assigned_to: number | null;
  sortOrder: string;
  sortField: string;
  typeUser: string | undefined;
  pageNumber: number;
  pageSize: number;
  read: number;
}

// exporting ROLES enums
export enum ROLES {
  Admin = 'ADMINISTRATION',
  SuperAdmin = 'SUPERADMIN',
  TeamMember = 'TEAMMEMBER',
  TeamLeader = 'TEAMLEADER',
  ChefEntity = 'CHEF',
}

// exporting USER_TYPE enums
export enum META_TYPE {
  PROD = 'PROD',
  SUPPORT = 'SUPPORT',
  ADMIN = 'ADMIN',
}

// exporting USER_TYPE enums
export enum USER_STATUS {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
}

// exporting Ticket Type enum
export enum TICKET_TYPE {
  Sales = 'SALES',
  Support = 'SUPPORT',
  ProdIT = 'SUPPORTIT',
  Offers = 'OFFERS',
}

export enum TICKET_SEVERITY {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
}

// exporting Ticket Status enum
export enum TICKET_STATUS {
  Open = 'OPEN',
  In_Progress = 'IN PROGRESS',
  Resolved = 'RESOLVED',
  Reopened = 'REOPENED',
  Closed = 'CLOSED',
}

export enum REQUEST_HOLIDAY_STATUS {
  Open = 'OPEN',
  Approve = 'APPROVE',
  Reject = 'REJECT',
  Cancel = 'CANCEL',
}

export enum TOPIC_STATUS {
  COMPLETED = 'COMPLETED',
  OPEN = 'OPEN',
}

export enum Login_Type {
  mobile = 'mobile',
  web = 'web',
}
