import { Entity, User } from "../../../../types";
import { transport } from "../../../../util/Api";
import { useQuery } from "react-query";
import { FC, ReactNode, useState, createContext } from "react";
import { group } from "radash";

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

export interface TimeType {
  value: string | undefined;
  id: number;
  startTime: string;
  endTime: string;
  deleted: boolean;
  bgColor: string;
  user: User;
  holiday: string;
}

export type UserType = User;

export interface EntityPlanning extends Pick<Entity, "id" | "name"> {
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
  entities: EntityPlanning[];
  setEntities: React.Dispatch<React.SetStateAction<EntityPlanning[]>>;
}

interface GlobalStateTime {
  times: TimeType[];
  setTimes: React.Dispatch<React.SetStateAction<TimeType[]>>;
}

interface GlobalStatePlanning {
  planning: PlanningType[];
  setplanning: React.Dispatch<React.SetStateAction<PlanningType[]>>;
}

interface GlobalStateState
  extends GlobalStateUser,
    GlobalStateTime,
    GlobalStatePlanning {}

export const context = createContext<GlobalStateState>(
  {} as unknown as GlobalStateState
);

const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  const [planning, setplanning] = useState<PlanningType[]>([]);
  const [entities, setEntities] = useState<EntityPlanning[]>([]);
  const [times, setTimes] = useState<TimeType[]>([]);

  // get user data from transport using axios
  useQuery<EntityPlanning[]>(
    "entities-users",
    async () =>
      await transport.get("/entities/withusers").then((res) => res.data),
    {
      onSuccess: (data) => {
        const ROLES = ["CHEF", "TEAMLEADER", "TEAMMEMBER"];

        const result1 = data?.map((obj) => {
          const dataWithoutChef = obj.users.filter(
            (user) => user?.team !== null
          );
          const chefData = obj.users.filter((user) => user?.team === null);
          const groupedData = group(dataWithoutChef, (d) => d.team?.id);
          let result;
          const newArray = [];
          const color: any = {};

          let index = 0;
          for (const data in groupedData) {
            color[data] = colors[index];
            index++;
            result = groupedData[data].sort((a, b) => {
              const res = ROLES.indexOf(a.role) - ROLES.indexOf(b.role);
              return res;
            });
            newArray.push(...result);
          }
          newArray.forEach((a) => (a.team.color = color[a.team?.id]));
          newArray.unshift(...chefData);
          obj.users = newArray;
          return obj;
        });
        setEntities(result1);
      },
    }
  );

  return (
    <context.Provider
      value={{ entities, setEntities, times, setTimes, planning, setplanning }}
    >
      {children}
    </context.Provider>
  );
};

export default Provider;
