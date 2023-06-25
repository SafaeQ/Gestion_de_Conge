import { Dropdown, Space } from "antd";
import logo from "../../routes/img/adsglory-without-bg.png";
import { footerText } from "../../util/config";
import App from "../../routes/index";
import { updateWindowWidth } from "../../appRedux/actions/settings";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarOutlined,
  CommentOutlined,
  DownOutlined,
  ProjectOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { transport } from "../../util/Api";
import { setCurrentUser } from "../../appRedux/actions/auth";
import { ROLE, User } from "../../types";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { RootState } from "../../appRedux/store";
import { AwayButton, ChatItem, TicketItem } from "../../routes/NotifeItem";
import ProLayout from "@ant-design/pro-layout";

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
      path: "/tickets",
      name: "Tickets",
      icon: <TagsOutlined />,
      roles: [ROLE.TEAMLEADER, ROLE.CHEF, ROLE.TEAMMEMBER],
    },
    {
      path: "/planning",
      name: "Planning",
      icon: <CalendarOutlined />,
      roles: [ROLE.TEAMLEADER, ROLE.CHEF, ROLE.TEAMMEMBER],
    },
    {
      path: "/chats",
      name: "Messages",
      icon: <CommentOutlined />,
      roles: [ROLE.CHEF],
    },
    {
      path: "/holiday-management",
      name: "Holiday Management",
      icon: <ProjectOutlined />,
      roles: [ROLE.TEAMLEADER, ROLE.CHEF, ROLE.TEAMMEMBER],
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

  const items: ItemType[] = [
    {
      key: "1",
      label: "LogOut",
      onClick: () => {
        transport
          .post("/auth/users/prod/logout")
          .then(() => {
            dispatch(setCurrentUser({} as unknown as User));
          })
          .catch(() => {
            dispatch(setCurrentUser({} as unknown as User));
          });
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
        title={"tickets PORTAL".toUpperCase()}
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
          return [
            <AwayButton key={"away"} />,
            <TicketItem key={"tags"} />,
            user?.role !== ROLE.TEAMMEMBER ? (
              <ChatItem key={"chat"} />
            ) : undefined,
            <h4 key={"balance"}>
              <span>Holiday Balance is</span> {user?.solde}
            </h4>,
          ];
        }}
        menuFooterRender={(props: any) => {
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
