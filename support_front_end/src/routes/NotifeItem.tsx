import { CommentOutlined, TagsOutlined } from "@ant-design/icons";
import { Badge, Button, Tag } from "antd";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../appRedux/store";
import { IqueryParams, ROLE, Ticket, USER_STATUS, User } from "../types";
import { transport } from "../util/Api";
import { useHistory } from "react-router-dom";
import { socket } from "../context/socket.provider";
import { setCurrentUser } from "../appRedux/actions/auth";

const { CheckableTag } = Tag;
export const ChatItem = () => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const enabled = user?.role === ROLE.TEAMLEADER || user?.role === ROLE.CHEF;

  const { data } = useQuery<number>(
    "checkmsg",
    async () =>
      await transport
        .get(`/conversations/unread/${user?.id ?? 0}`)
        .then((res) => res.data),
    {
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
      notifyOnChangeProps: ["data"],
      enabled,
    }
  );
  const history = useHistory();

  return (
    <Badge key={"BellFilled"} count={data} size="small">
      <Button shape="circle" onClick={() => history.push("chats")}>
        <CommentOutlined />
      </Button>
    </Badge>
  );
};

export const TicketItem = () => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  const [queryParams, setQueryParams] = useState<IqueryParams | null>(null);

  useEffect((): void => {
    if (user?.role !== undefined) {
      let filter: IqueryParams["filter"] = {};
      if (user?.role === "TEAMMEMBER") {
        filter = {
          target_team: ["id", user.access_team],
          user: {
            id: user.id,
          },
        };
      } else if (user?.role === "TEAMLEADER") {
        filter = {
          target_team: ["id", user.access_team],
          user: {
            id: user?.id,
          },
        };
      } else if (user?.role === "CHEF") {
        filter = {
          departement: ["id", user.departements.map((depart) => depart.id)],
          user: {
            id: user.id,
          },
        };
      } else {
        filter = {
          departement: ["id", user.departements.map((depart) => depart.id)],
          user: {
            id: user.id,
          },
        };
      }
      const defaultParams = {
        access_entity: user?.access_entity ?? [],
        access_team: user?.access_team ?? [],
        assigned_to: ["TEAMLEADER", "CHEF"].includes(user.role)
          ? null
          : user.id,
        filter,
        pageNumber: 1,
        pageSize: 10,
        typeUser: user?.user_type,
        read: user?.id ?? 0,
        sortField: "updatedAt",
        sortOrder: "desc",
      };
      setQueryParams(defaultParams);
    }
  }, [user]);

  const { data } = useQuery<number, Ticket>(
    ["ticketss", queryParams],
    async () =>
      await transport
        .post("/tickets/open", { queryParams })
        .then((res) => res.data),
    {
      enabled: !(queryParams == null),
      refetchInterval: 10000,
      refetchIntervalInBackground: true,
      notifyOnChangeProps: ["data"],
    }
  );

  const history = useHistory();

  return (
    <Badge key={"tags"} count={data} size="small">
      <Button shape="circle" onClick={() => history.push("tickets")}>
        <TagsOutlined />
      </Button>
    </Badge>
  );
};
export const AwayButton = () => {
  const [online, setOnline] = useState(true);
  const [user, setUser] = useState<User | undefined>(undefined);
  const dispatch = useDispatch();

  useQuery<{ user: User }>(
    "user",
    async () =>
      await transport.get("/auth/users/tech/me").then((res) => res.data),
    {
      onSuccess: (data) => {
        setUser(data.user);
        dispatch(setCurrentUser(data.user));
      },
      refetchInterval: 3000,
    }
  );

  return (
    <>
      <CheckableTag
        checked={online}
        style={{
          backgroundColor:
            user?.activity === USER_STATUS.ONLINE
              ? "green"
              : user?.activity === USER_STATUS.AWAY
              ? "orange"
              : "red",
        }}
        onChange={(checked) => {
          setOnline(checked);
          if (checked) {
            console.log("checked");

            socket.emit("user-online", {
              userId: user?.id,
              activity: USER_STATUS.ONLINE,
              type: "click",
            });
          } else {
            socket.emit("user-online", {
              userId: user?.id,
              activity: USER_STATUS.AWAY,
              type: "click",
            });
          }
        }}
      >
        {user?.activity}
      </CheckableTag>
    </>
  );
};
