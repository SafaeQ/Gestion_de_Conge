import { useState } from "react";
import { Drawer, Layout } from "antd";

import SidebarContent from "./SidebarContent";
import { useAppDispatch, useAppSelector } from "../../appRedux/hooks";
import { TAB_SIZE } from "../../constants/ThemeSetting";
import { toggleCollapsedSideNav } from "../../appRedux/actions/settings";

const { Sider } = Layout;

const Sidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { width, navCollapsed } = useAppSelector(({ settings }) => settings);
  const dispatch = useAppDispatch();

  const onToggleCollapsedNav = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };
  return (
    <Sider
      className={`gx-app-sidebar gx-drawer-sidebar-dark`}
      trigger={null}
      collapsed={width < TAB_SIZE ? false : sidebarCollapsed}
      collapsible
    >
      {width < TAB_SIZE ? (
        <Drawer
          className={`gx-drawer-sidebar`}
          placement="left"
          closable={false}
          onClose={onToggleCollapsedNav}
          open={navCollapsed}
        >
          <SidebarContent
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </Drawer>
      ) : (
        <SidebarContent
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      )}
    </Sider>
  );
};
export default Sidebar;
