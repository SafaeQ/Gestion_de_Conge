import { lazy, Suspense, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import Spinner from "../containers/Spinner";

import Provider from "./pages/Planning/context/planningContext";
import DragDrop from "./pages/Planning/Components/Home";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button, Result } from "antd";
import { socket } from "../context/socket.provider";
import { useSelector } from "react-redux";
import { RootState } from "../appRedux/store";
import { Complaints, User, USER_STATUS } from "../types";
import UpdateRequest from "./pages/HolidayManagement/Components/Update";
import { toast } from "react-toastify";
import { BellOutlined } from "@ant-design/icons";
import useSound from "use-sound";
import pointBlank from "./pages/Tickets/sounds/point-blank-589.mp3";
import addNotification from "react-push-notification";

// const Tools = lazy(async () => await import('./pages/Tools/Tools'))
// const CreateTool = lazy(async () => await import("./pages/Tools/Create"));
// const UpdateTool = lazy(async () => await import("./pages/Tools/Update"));

const Sponsors = lazy(async () => await import("./pages/Sponsors/Sponsors"));
const CreateSponsor = lazy(async () => await import("./pages/Sponsors/Create"));
const UpdateSponsor = lazy(async () => await import("./pages/Sponsors/Update"));

const Departements = lazy(
  async () => await import("./pages/Departements/Departements")
);
const CreateDepartement = lazy(
  async () => await import("./pages/Departements/Create")
);
const UpdateDepartement = lazy(
  async () => await import("./pages/Departements/Update")
);
const Topics = lazy(async () => await import("./pages/Topics/Topics"));

const Entities = lazy(async () => await import("./pages/Entities/Entities"));
const CreateEntity = lazy(async () => await import("./pages/Entities/Create"));
const UpdateEntity = lazy(async () => await import("./pages/Entities/Update"));
const Import = lazy(async () => await import("./pages/Entities/Import"));

const Teams = lazy(async () => await import("./pages/Teams/Teams"));
const CreateTeam = lazy(async () => await import("./pages/Teams/Create"));
const UpdateTeam = lazy(async () => await import("./pages/Teams/Update"));

const Tickets = lazy(async () => await import("./pages/Tickets/Tickets"));
const UpdateTicket = lazy(async () => await import("./pages/Tickets/Update"));

const Users = lazy(async () => await import("./pages/Users/Users"));
const CreateUser = lazy(async () => await import("./pages/Users/Create"));
const UpdateUser = lazy(async () => await import("./pages/Users/Update"));

const Dashboard = lazy(async () => await import("./pages/Dashboard/index"));

const Sessions = lazy(async () => await import("./pages/Sessions/Sessions"));

const Planning = () => {
  return (
    <Provider>
      <DndProvider backend={HTML5Backend}>
        <DragDrop />
      </DndProvider>
    </Provider>
  );
};

const HolidayHome = lazy(
  async () => await import("./pages/HolidayManagement/Components/HolidayHome")
);

// define application routes
const routes = [
  {
    component: Users,
    path: "users",
    exact: true,
  },
  {
    component: CreateUser,
    path: "users/create",
    exact: true,
  },
  {
    component: UpdateUser,
    path: "users/:id/edit",
    exact: true,
  },
  {
    component: Departements,
    path: "departements",
    exact: true,
  },
  // {
  //   component: Messages,
  //   path: "messages",
  //   exact: true,
  // },
  {
    component: CreateDepartement,
    path: "departements/create",
    exact: true,
  },
  {
    component: UpdateDepartement,
    path: "departements/:id/edit",
    exact: true,
  },
  {
    component: Entities,
    path: "entities",
    exact: true,
  },
  {
    component: CreateEntity,
    path: "entities/create",
    exact: true,
  },
  {
    component: Import,
    path: "entities/import",
    exact: true,
  },
  {
    component: UpdateEntity,
    path: "entities/:id/edit",
    exact: true,
  },
  {
    component: Sponsors,
    path: "sponsors",
    exact: true,
  },
  {
    component: CreateSponsor,
    path: "sponsors/create",
    exact: true,
  },
  {
    component: UpdateSponsor,
    path: "sponsors/:id/edit",
    exact: true,
  },
  // {
  //   component: Tools,
  //   path: 'tools',
  //   exact: true
  // },
  // {
  //   component: CreateTool,
  //   path: "tools/create",
  //   exact: true,
  // },
  // {
  //   component: UpdateTool,
  //   path: "tools/:id/edit",
  //   exact: true,
  // },
  {
    component: Teams,
    path: "teams",
    exact: true,
  },
  {
    component: CreateTeam,
    path: "teams/create",
    exact: true,
  },
  {
    component: UpdateTeam,
    path: "teams/:id/edit",
    exact: true,
  },
  {
    component: Tickets,
    path: "tickets",
    exact: true,
  },
  {
    component: UpdateTicket,
    path: "tickets/:id/edit",
    exact: true,
  },
  {
    component: Planning,
    path: "planning",
    exact: true,
  },
  {
    component: Topics,
    path: "topics",
    exact: true,
  },
  {
    component: Dashboard,
    path: "dashboard",
    exact: true,
  },
  {
    component: Sessions,
    path: "sessions",
    exact: true,
  },
  {
    component: HolidayHome,
    path: "holiday-management",
    exact: true,
  },
  {
    component: UpdateRequest,
    path: "holidays/update/:id",
    exact: true,
  },
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
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  const [holidaySound] = useSound(pointBlank);

  useEffect(() => {
    socket.io.on("ping", () => {
      console.log("connect", user?.id);
      socket.emit("user-online", {
        userId: user?.id,
        activity: USER_STATUS.ONLINE,
      });
    });

    // complaint notifee for admin
    socket.on(`complainCreated`, async (complain: Complaints) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      toast(`You have a New Complaint ${complain.id}`, {
        icon: <BellOutlined style={{ color: "white" }} />,
        position: "top-right",
        theme: "colored",
        autoClose: 5000,
        progressStyle: { backgroundColor: "#FEA1A1" },
        style: { backgroundColor: "#EC7272", color: "#fff" },
      });
      addNotification({
        title: "Complaints",
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        message: `You have a New Complaint ${complain.id}`,
        theme: "darkblue",
        duration: 20000000,
        native: true,
      });
      holidaySound();
    });
  }, [socket]);

  return (
    <div>
      <Switch>
        <Suspense fallback={<Spinner />}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {routes.map((route) => (
              <Route
                key={route.path}
                exact={route.exact}
                path={`/${route.path}`}
                component={route.component}
              />
            ))}
          </ErrorBoundary>
        </Suspense>
        <Redirect from="/" to="/tickets" />
      </Switch>
    </div>
  );
};

export default App;
