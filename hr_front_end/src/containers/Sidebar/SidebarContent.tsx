import { Menu, MenuProps } from "antd";
import { Dispatch, memo, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scrollbars } from "rc-scrollbars";
import SidebarLogo from "./SidebarLogo";
import UserProfile from "./UserProfile";
import {
  TagsOutlined,
  CommentOutlined,
  CalendarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { IqueryParams, ROLE, Ticket, User } from "../../types";
import { useSelector } from "react-redux";
import { RootState } from "../../appRedux/store";
import { useQuery } from "react-query";
import { transport } from "../../util/Api";
import { socket } from "../../context/socket.provider";
import { useNotification } from "../../util/useNotification";

interface Props {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Dispatch<React.SetStateAction<boolean>>;
}
const SidebarContent: React.FC<Props> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const [count, setCount] = useState(0);
  const [queryParams, setQueryParams] = useState<IqueryParams | null>(null);

  const enabled = user?.role === ROLE.TEAMLEADER || user?.role === ROLE.CHEF;
  useQuery<number>(
    "unreads",
    async () =>
      await transport
        .get(`/conversations/unread/${user?.id ?? 0}`)
        .then((res) => res.data),
    {
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
      enabled,
      onSuccess: (count) => {
        setCount(count);
      },
    }
  );
  /* A hook that is used to fetch data from the server. */
  const { data } = useQuery<{
    entities: Ticket[];
    totalCount: number;
  }>(
    ["opentickets", queryParams],
    async () =>
      await transport
        .post("/tickets/tech/find", { queryParams })
        .then((res) => res.data),
    {
      enabled: !(queryParams == null),
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
      onSuccess(data) {},
    }
  );

  useEffect(() => {
    if (data != null) {
      for (const ticket of data.entities) {
        socket.on(`messageCreated-${ticket.id}`, async () => {
          useNotification(
            user,
            ticket,
            `You have a New Message (#${ticket.id})`
          );
        });
      }
    }
    if (user?.role !== undefined) {
      let filter: IqueryParams["filter"] = {};
      if (user?.role === "TEAMMEMBER") {
        filter = {
          target_team: {
            id: user.team?.id,
          },
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
        read: user?.id ?? 0,
        sortField: "updatedAt",
        sortOrder: "desc",
      };
      setQueryParams(defaultParams);
    }

    return () => {
      if (data != null) {
        for (const ticket of data.entities) {
          socket.off(`messageCreated-${ticket.id}`);
        }
      }
    };
  }, [user, data]);

  const { pathname } = useLocation();

  const selectedKeys = pathname.split("/")[1];

  const items: MenuProps["items"] = [
    {
      label: (
        <Link to="/tickets">
          <span>Tickets</span>
        </Link>
      ),
      key: "tickets",
      icon: <TagsOutlined />,
      roles: [ROLE.TEAMLEADER, ROLE.CHEF, ROLE.TEAMMEMBER, ROLE.ADMIN],
    }, // which is required
    {
      label: (
        <Link to="/planning">
          <span>Planning</span>
        </Link>
      ),
      key: "planning",
      icon: <CalendarOutlined />,
      roles: [ROLE.TEAMLEADER, ROLE.CHEF, ROLE.TEAMMEMBER, ROLE.ADMIN],
    },
    {
      label: (
        <Link to="/chats">
          <span className="gx-mr-5">Messages</span>
          {count > 0 ? (
            <div className="gx-bg-danger gx-rounded-circle gx-badge gx-text-white">
              {count}
            </div>
          ) : null}
        </Link>
      ),
      key: "chats",
      icon: <CommentOutlined />,
      roles: [ROLE.TEAMLEADER, ROLE.CHEF],
    },
    {
      label: (
        <Link to="/sponsors">
          <span>Sponsors</span>
        </Link>
      ),
      key: "sponsors",
      icon: <ShoppingOutlined />,
      roles: [ROLE.CHEF],
    },
  ].filter((item) => item.roles.includes(user?.role as ROLE));

  return (
    <>
      <SidebarLogo
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div className="">
        <div className={`gx-sidebar-notifications`}>
          <UserProfile />
        </div>
        <Scrollbars autoHide className="gx-layout-sider-scrollbar">
          <Menu
            defaultOpenKeys={[]}
            selectedKeys={[selectedKeys]}
            theme="light"
            items={items}
            mode="inline"
          />
        </Scrollbars>
      </div>
    </>
  );
};

export default memo(SidebarContent);
