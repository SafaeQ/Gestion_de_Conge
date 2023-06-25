import { stringify } from "query-string";
import { group } from "radash";
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";
import { Entity, User } from "../../../../types";
import { transport } from "../../../../util/Api";

export interface TimeType {
  id: number;
  value: string | undefined;
  bgColor: string;
  user: User;
  entity: Entity;
  todelete: boolean;
  deleted: boolean;
  startTime: string;
  endTime: string;
  holiday: string;
}

export type UserType = User;

export interface EntityPlanning extends Pick<Entity, "name"> {
  users: UserType[];
}

export interface PlanningType {
  id?: number | string;
  day: string;
  shift: TimeType;
  user: User;
  boxDay: number;
  isSaved: boolean;
}

interface GlobalStateUser {
  users: UserType[];
  setUsers: Dispatch<SetStateAction<UserType[]>>;
}

interface GlobalStateTime {
  times: TimeType[];
  setTimes: Dispatch<SetStateAction<TimeType[]>>;
}

interface GlobalStatePlanning {
  planning: PlanningType[];
  setplanning: Dispatch<SetStateAction<PlanningType[]>>;
}

interface GlobalStateState
  extends GlobalStatePlanning,
    GlobalStateTime,
    GlobalStateUser {}

const colors = [
  "#e9edc9",
  "#d4a373",
  "#219ebc",
  "#8ecae6",
  "#f4a261",
  "#a8dadc",
  "#457b9d",
  "#ffb703",
  "#d6ccc2",
  "#e9edc9",
  "#d4a373",
  "#219ebc",
  "#8ecae6",
  "#f4a261",
  "#a8dadc",
  "#457b9d",
  "#ffb703",
  "#d6ccc2",
];

export const context = createContext<GlobalStateState>(
  {} as unknown as GlobalStateState
);

const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [times, setTimes] = useState<TimeType[]>([]);
  const [planning, setplanning] = useState<PlanningType[]>([]);

  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  // get user data from transport using axios
  useQuery(
    "planning-users",
    async () => {
      let query = "";
      switch (user?.role) {
        case "TEAMLEADER":
          query = stringify(
            {
              entity: user.entity?.id,
              team:
                user.access_planning_teams.length > 0
                  ? user.access_planning_teams.map((team) => team)
                  : user.team.id,
              departements: user.departements?.map(
                (departement) => departement.id
              ),
            },
            { arrayFormat: "index" }
          );
          break;
        case "TEAMMEMBER":
          query = stringify(
            {
              entity: user.entity?.id,
              team: user.team.id,
              departements: user.departements?.map(
                (departement) => departement.id
              ),
            },
            { arrayFormat: "index" }
          );
          break;
        case "CHEF":
          query = stringify(
            {
              entity: user.entity?.id,
              departements: user.departements?.map(
                (departement) => departement.id
              ),
            },
            { arrayFormat: "index" }
          );
          break;
        default:
          break;
      }

      return await transport
        .get<UserType[]>(`/users/filtering?${query}`)
        .then((res) => res.data);
    },
    {
      onSuccess(data: UserType[]) {
        const ROLES = ["CHEF", "TEAMLEADER", "TEAMMEMBER"];
        const dataWithoutChef = data.filter((user) => user?.team !== null);
        const chefData = data.filter((user) => user?.team === null);
        const groupedData = group(dataWithoutChef, (d) => d.team.id);
        let result;
        let newArray: any[] | ((prevState: User[]) => User[]) = [];
        const color: any = {};

        let index = 0;
        for (const data in groupedData) {
          color[data] = colors[index];
          index++;
          result = groupedData[data].sort((a, b) => {
            const res = ROLES.indexOf(a.role) - ROLES.indexOf(b.role);
            return res;
          });
          newArray = [...newArray, ...result];
        }
        newArray.forEach((a) => (a.team.color = color[a.team.id]));
        newArray.unshift(...chefData);
        setUsers(newArray);
      },
    }
  );

  return (
    <context.Provider
      value={{
        users,
        setUsers,
        times,
        setTimes,
        planning,
        setplanning,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default Provider;
