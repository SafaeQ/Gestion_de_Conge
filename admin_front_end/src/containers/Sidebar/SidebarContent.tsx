import { Menu, MenuProps } from "antd";
import { Dispatch } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scrollbars } from "rc-scrollbars";
import SidebarLogo from "./SidebarLogo";
import UserProfile from "./UserProfile";
import {
  ApartmentOutlined,
  BankOutlined,
  CalendarOutlined,
  // DashboardOutlined,
  NotificationOutlined,
  PartitionOutlined,
  TagsOutlined,
  ShoppingOutlined,
  UserAddOutlined,
  UngroupOutlined,
  // AppstoreAddOutlined
} from "@ant-design/icons";

const items: MenuProps["items"] = [
  // {
  //   label: (
  //     <Link to='/dashboard'>
  //       <span>Dashboard</span>
  //     </Link>
  //   ),
  //   key: 'dashboard',
  //   icon: <DashboardOutlined />
  // },
  {
    label: (
      <Link to="/departements">
        <span>Departements</span>
      </Link>
    ),
    key: "departements",
    icon: <BankOutlined />,
  }, // remember to pass the key prop
  {
    label: (
      <Link to="/entities">
        <span>Entities</span>
      </Link>
    ),
    key: "entities",
    icon: <ApartmentOutlined />,
  },
  {
    label: (
      <Link to="/teams">
        <span>Teams</span>
      </Link>
    ),
    key: "teams",
    icon: <PartitionOutlined />,
  },
  {
    label: (
      <Link to="/users">
        <span>Users</span>
      </Link>
    ),
    key: "users",
    icon: <UserAddOutlined />,
  },
  {
    label: (
      <Link to="/tickets">
        <span>Tickets</span>
      </Link>
    ),
    key: "tickets",
    icon: <TagsOutlined />,
  },
  {
    label: (
      <Link to="/topics">
        <span>Topics</span>
      </Link>
    ),
    key: "topics",
    icon: <NotificationOutlined />,
  },
  {
    label: (
      <Link to="/planning">
        <span>Planning</span>
      </Link>
    ),
    key: "planning",
    icon: <CalendarOutlined />,
  },
  {
    label: (
      <Link to="/messages">
        <span>Messages</span>
      </Link>
    ),
    key: "messages",
    icon: <TagsOutlined />,
  },
  {
    label: (
      <Link to="/sponsors">
        <span>Sponsors</span>
      </Link>
    ),
    key: "sponsors",
    icon: <ShoppingOutlined />,
  },
  {
    label: (
      <Link to="/sessions">
        <span>Sessions</span>
      </Link>
    ),
    key: "sessions",
    icon: <UngroupOutlined />,
  },
  // {
  //   label: (
  //     <Link to='/tools'>
  //       <span>Tools</span>
  //     </Link>
  //   ),
  //   key: 'tools',
  //   icon: <AppstoreAddOutlined />
  // }
];

interface Props {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContent: React.FC<Props> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const { pathname } = useLocation();

  const selectedKeys = pathname.split("/")[1];

  return (
    <>
      <SidebarLogo
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div>
        <div className="gx-sidebar-notifications">
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
