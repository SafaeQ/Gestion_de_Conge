import { Menu, MenuProps } from "antd";
import { Dispatch, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scrollbars } from "rc-scrollbars";
import SidebarLogo from "./SidebarLogo";
import UserProfile from "./UserProfile";
import {
  CommentOutlined,
  TagsOutlined,
  CalendarOutlined,
  // AppstoreAddOutlined
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../appRedux/store";
import { ROLE, User } from "../../types";
import { useQuery } from "react-query";
import { transport } from "../../util/Api";

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
      roles: [ROLE.TEAMLEADER, ROLE.CHEF, ROLE.TEAMMEMBER],
    }, // which is required
    {
      label: (
        <Link to="/planning">
          <span>Planning</span>
        </Link>
      ),
      key: "planning",
      icon: <CalendarOutlined />,
      roles: [ROLE.TEAMLEADER, ROLE.CHEF, ROLE.TEAMMEMBER],
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
      roles: [ROLE.CHEF],
    },
    // {
    //   label: (
    //     <Link to='/tools'>
    //       <span>Tools</span>
    //     </Link>
    //   ),
    //   key: 'tools',
    //   icon: <AppstoreAddOutlined />,
    //   roles: [ROLE.TEAMLEADER, ROLE.CHEF, ROLE.TEAMMEMBER]
    // },
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

export default SidebarContent;
