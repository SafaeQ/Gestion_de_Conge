import { Dropdown, Space } from "antd";
import logo from "../../routes/img/adsglory-without-bg.png";
import { footerText } from "../../util/config";
import App from "../../routes/index";
import { updateWindowWidth } from "../../appRedux/actions/settings";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  ApartmentOutlined,
  BankOutlined,
  CalendarOutlined,
  DownOutlined,
  NotificationOutlined,
  PartitionOutlined,
  ProjectOutlined,
  ShoppingOutlined,
  TagsOutlined,
  UngroupOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { transport } from "../../util/Api";
import { setCurrentUser } from "../../appRedux/actions/auth";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { User } from "../../types";
import { RootState } from "../../appRedux/store";
import ProLayout from "@ant-design/pro-layout";
import { ComplaintItem } from "../../routes/NotifeItem";

const MainApp = () => {
  const dispatch = useDispatch();

  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  useEffect(() => {
    window.addEventListener("resize", () => {
      dispatch(updateWindowWidth(window.innerWidth));
    });
  }, [dispatch]);

  const defaultMenus = [
    {
      path: "/departements",
      name: "Departements",
      icon: <BankOutlined />,
    },
    {
      path: "/entities",
      name: "Entities",
      icon: <ApartmentOutlined />,
    },
    {
      path: "/teams",
      name: "Teams",
      icon: <PartitionOutlined />,
    },
    {
      path: "/users",
      name: "Users",
      icon: <UserAddOutlined />,
    },
    {
      path: "/tickets",
      name: "Tickets",
      icon: <TagsOutlined />,
    },
    {
      path: "/topics",
      name: "topics",
      icon: <NotificationOutlined />,
    },
    {
      path: "/planning",
      name: "Planning",
      icon: <CalendarOutlined />,
    },
    {
      path: "/sponsors",
      name: "Sponsors",
      icon: <ShoppingOutlined />,
    },
    {
      path: "/sessions",
      name: "Sessions",
      icon: <UngroupOutlined />,
    },
    {
      path: "holiday-management",
      name: "Holiday Management",
      icon: <ProjectOutlined />,
    },
    // {
    //   path: "/tools",
    //   name: "Tools",
    //   icon: "tools",
    //   roles: [ROLE.CHEF],
    // },
  ];

  const items: ItemType[] = [
    {
      key: "1",
      label: "LogOut",
      onClick: () => {
        transport
          .post("/auth/users/admin/logout")
          .then(() => {
            localStorage.removeItem("user-id");
            dispatch(setCurrentUser(undefined));
          })
          .catch((err) => console.log(err));
      },
    },
  ];
  return (
    <>
      <ProLayout
        menuItemRender={(menu: any, dom: any) => (
          <Link to={menu.path as string}>{dom}</Link>
        )}
        token={{
          header: {
            colorBgMenuItemSelected: "#ebf8ff",
          },
        }}
        title={"ADMIN".toUpperCase()}
        fixedHeader={true}
        layout="top"
        logo={logo}
        siderMenuType="group"
        disableMobile={true}
        avatarProps={{
          src: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
          size: "large",
          title: (
            <Dropdown menu={{ items }}>
              <Space>
                {user?.name}
                <DownOutlined />
              </Space>
            </Dropdown>
          ),
        }}
        actionsRender={() => {
          return [<ComplaintItem key={"complaint"} />];
        }}
        menuFooterRender={(props: any) => {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (props?.collapsed ?? false) return undefined;
          return (
            <div style={{ textAlign: "center", paddingBlockStart: 12 }}>
              <div>{footerText}</div>
            </div>
          );
        }}
        route={{
          routes: defaultMenus,
        }}
      >
        <App />
      </ProLayout>
    </>
  );
};
export default MainApp;
