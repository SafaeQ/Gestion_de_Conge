import { lazy, Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import { Redirect, Switch } from "react-router-dom";
import { RootState } from "../appRedux/store";
import Authinit from "../containers/Auth/Authinit";
import ProtectedRoute from "../containers/hoc/PrivateRoute";
import TeamLeaderProtectedRoute from "../containers/hoc/PrivateRoute2";
import Spinner from "../containers/Spinner";
import { Chat, Complaints, Holiday, ROLE, User, USER_STATUS } from "../types";
import { DndProvider } from "react-dnd";
import DragDrop from "./pages/Planning/Components/Home";
import { HTML5Backend } from "react-dnd-html5-backend";
import Provider from "./pages/Planning/context/planningContext";

import { ErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import { Button, Result } from "antd";
import { socket } from "../context/socket.provider";
import addNotification from "react-push-notification";
import { toast } from "react-toastify";
import { BellOutlined } from "@ant-design/icons";
import useSound from "use-sound";
// import UpdateRequest from "./pages/HolidayManagement/Components/Update";
// import Tools from './pages/Tools/Tools'
import pointBlank from "../sounds/point-blank-589.mp3";
import UpdateComplain from "./pages/Tickets/Complaints/Update";
import { useQuery } from "react-query";
import { transport } from "../util/Api";

const Tickets = lazy(async () => await import("./pages/Tickets/Tickets"));
const ChatPage = lazy(async () => await import("./pages/Chat"));
const HolidayHome = lazy(
  async () => await import("./pages/HolidayManagement/Components/HolidayHome")
);

const Planning = () => {
  return (
    <Provider>
      <DndProvider backend={HTML5Backend}>
        <DragDrop />
      </DndProvider>
    </Provider>
  );
};

// define application routes
const routes = [
  {
    component: Tickets,
    path: "tickets",
    exact: true,
    scope: "member",
  },
  {
    component: ChatPage,
    path: "chats",
    exact: true,
    scope: "leader",
  },
  {
    component: Planning,
    path: "planning",
    exact: true,
    scope: "member",
  },
  {
    component: HolidayHome,
    path: "holiday-management",
    exact: true,
    scope: "member",
  },
  {
    component: UpdateComplain,
    path: "complaints/edit/:id",
    exact: true,
    scope: "member",
  },
  // {
  //   component: UpdateRequest,
  //   path: "holidays/update/:id",
  //   exact: true,
  //   scope: "chef",
  // },
  // {
  //   component: Tools,
  //   path: 'tools',
  //   scope: 'member'
  // }
];

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  console.log(error.message);
  return (
    <Result
      status="error"
      title="Error"
      subTitle="Sorry, something went wrong."
      extra={
        <Button type="primary" onClick={resetErrorBoundary}>
          Back Home
        </Button>
      }
    />
  );
}

const App = () => {
  const isAuthenticated = useSelector<RootState, boolean | undefined>(
    (state) => state.auth.isAuthenticated
  );
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const [holidaySound] = useSound(pointBlank);

  const { data: Complaints } = useQuery<Complaints[]>(
    "Complaints-by-entity",
    async () =>
      await transport
        .post("/complaints/chef", { id: user?.id })
        .then((res) => res.data)
  );

  useEffect(() => {
    socket.emit("user-online", {
      userId: user?.id,
      activity: USER_STATUS.ONLINE,
    });
    socket.on(`received:message`, async (message: Chat) => {
      if (message.to.id === user?.id) {
        addNotification({
          title: "Ticketings.org",
          message: `You have a New Message`,
          theme: "darkblue",
          duration: 20000000,
          native: true, // when using native, your OS will handle theming.
        });
      }
    });
    socket.io.on("ping", () => {
      socket.emit("user-online", {
        userId: user?.id,
        activity: USER_STATUS.ONLINE,
      });
    });

    // notife for chef according to thier entity in prod
    if (user?.role === ROLE.CHEF) {
      socket.on(`holiday-created-prod`, async (holiday: Holiday) => {
        if (user?.entity.id === holiday.user.entity.id) {
          toast(`You have a New Holiday Request ${holiday.id}`, {
            icon: <BellOutlined style={{ color: "white" }} />,
            position: "top-right",
            theme: "colored",
            autoClose: 5000,
            progressStyle: { backgroundColor: "#FEA1A1" },
            style: { backgroundColor: "#EC7272", color: "#fff" },
          });
          addNotification({
            title: "Holidays",
            message: `You have a New Holiday Request ${holiday.id}`,
            theme: "darkblue",
            duration: 20000000,
            native: true,
          });
          holidaySound();
        }
      });
    }
    // notife for complaints is seen
    if (Complaints != null) {
      if (user?.role !== ROLE.CHEF) {
        for (const complaint of Complaints) {
          socket.on(
            `complainSeen-prod-${complaint.user.id}-${complaint.id}`,
            async () => {
              toast(`Your Complain ${complaint.id} was seen  `, {
                icon: <BellOutlined style={{ color: "white" }} />,
                position: "top-right",
                theme: "colored",
                autoClose: 5000,
                progressStyle: { backgroundColor: "#FEA1A1" },
                style: { backgroundColor: "#EC7272", color: "#fff" },
              });
              addNotification({
                title: "Complaints",
                message: `Your Complain ${complaint.id} was seen  `,
                theme: "darkblue",
                duration: 20000000,
                native: true,
              });
              holidaySound();
            }
          );
        }
      }
    }

    return () => {
      if (user?.role === ROLE.CHEF) {
        socket.off(`holiday-created-prod`);
      }
      if (Complaints != null) {
        for (const complaint of Complaints) {
          socket.off(`complainSeen-prod-${complaint.user.id}-${complaint.id}`);
        }
      }
      socket.removeListener(`received:message`);
    };
  }, []);

  return (
    <div>
      <Switch>
        <Suspense fallback={<Spinner />}>
          <Authinit>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {routes.map((route) => {
                if (route.scope === "member") {
                  return (
                    <ProtectedRoute
                      user={user}
                      isAuthenticated={!(isAuthenticated === false)}
                      key={route.path}
                      exact={route.exact}
                      path={`/${route.path}`}
                      component={route.component}
                    />
                  );
                }
                return (
                  <TeamLeaderProtectedRoute
                    user={user}
                    isAuthenticated={!(isAuthenticated === false)}
                    key={route.path}
                    exact={route.exact}
                    path={`/${route.path}`}
                    component={route.component}
                  />
                );
              })}
            </ErrorBoundary>
          </Authinit>
        </Suspense>
        <Redirect from="/" to="/tickets" />
      </Switch>
    </div>
  );
};

export default App;
