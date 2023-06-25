import { lazy, Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Redirect, Switch } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import { RootState } from "../appRedux/store";
import useSound from "use-sound";
import Authinit from "../containers/Auth/Authinit";
import Spinner from "../containers/Spinner";
import {
  Chat,
  Complaints,
  Holiday,
  IqueryParams,
  Ticket,
  User,
  USER_STATUS,
} from "../types";

import Provider from "./pages/Planning/context/planningContext";
import { Button, Result } from "antd";
import DragDropAdmin from "./pages/Planning/Components/HomeAdmin";
import addNotification from "react-push-notification";
import { socket } from "../context/socket.provider";
import { useNotification } from "../util/useNotification";
import pointBlank from "../sounds/point-blank-589.mp3";
import { transport } from "../util/Api";
import { useQuery } from "react-query";
import { toast } from "react-toastify";
import { BellOutlined } from "@ant-design/icons";
import inform from "../sounds/youve-been-informed-345.mp3";
import UpdateRequest from "./pages/HolidayManagement/Components/Update";
import UpdateUser from "./pages/Users/Update";
import AdminProtectedRoute from "../containers/hoc/AdminPrivateRoute";

const Tickets = lazy(async () => await import("./pages/Tickets/Tickets"));
const HolidayDate = lazy(
  async () => await import("./pages/HolidayManagement/Components/HolidaysDates")
);
const Users = lazy(async () => await import("./pages/Users/Users"));
const CreateUser = lazy(async () => await import("./pages/Users/Create"));
const HolidayComponent = lazy(
  async () => await import("./pages/HolidayManagement/Components/HrHoliday")
);
const Planning = () => {
  return <Provider>{<DragDropAdmin />}</Provider>;
};

// define application routes
const routes = [
  {
    component: Tickets,
    path: "tickets",
    exact: true,
  },
  {
    component: Planning,
    path: "planning",
    exact: true,
  },
  {
    component: HolidayComponent,
    path: "holiday-management",
    exact: true,
  },
  {
    component: UpdateRequest,
    path: "holidays/tech/update/:id",
    exact: true,
  },
  {
    component: HolidayDate,
    path: "public-holidays",
    exact: true,
  },
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
    path: "users/edit/:id",
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
  const [ticketSound] = useSound(pointBlank);
  const [holidaySound] = useSound(pointBlank);
  const [queryParams, setQueryParams] = useState<IqueryParams | null>(null);
  const [updateTicket] = useSound(inform);

  const isAuthenticated = useSelector<RootState, boolean | undefined>(
    (state) => state.auth.isAuthenticated
  );
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  const makeSound = (ticket: Ticket) => {
    // depending on user role and condition, we will make sound
    if (
      user?.role === "CHEF" &&
      user?.departements
        .map((depart) => depart.id)
        .includes(ticket.departement.id) &&
      user.access_entity.includes(ticket.entity?.id)
    ) {
      ticketSound();
    } else if (
      user?.team !== undefined &&
      user.team.id === ticket.target_team?.id &&
      user.access_entity.includes(ticket.entity?.id)
    ) {
      ticketSound();
    }
  };
  const { data, refetch } = useQuery<{
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
      // refetchInterval: 2000,
      // refetchIntervalInBackground: true,
      // onSuccess(data) {
      //   setNewTicketsCount(
      //     data.entities.filter(
      //       (t) => t.status === TICKET_STATUS.Open && t.user.id !== user?.id
      //     ).length
      //   );
      // },
    }
  );

  useEffect(() => {
    socket.emit("user-online", {
      userId: user?.id,
      activity: USER_STATUS.ONLINE,
    });
    socket.on("received:message", async (message: Chat) => {
      if (message.to.id === user?.id) {
        toast(`You have a New Message`, {
          icon: <BellOutlined style={{ color: "red" }} />,
          position: "top-right",
        });
        addNotification({
          title: "Ticketings.org",
          message: `You have a New Message`,
          theme: "darkblue",
          duration: 20000000,
          native: true, // when using native, your OS will handle theming.
        });
      }
    });
    socket.on("ticket-created", async (ticket: Ticket) => {
      makeSound(ticket);
      useNotification(user, ticket, `You have a New Ticket (#${ticket.id})`);
    });
    socket.on("ticket-forwarded", async (ticket: Ticket) => {
      makeSound(ticket);
      useNotification(
        user,
        ticket,
        `You have a New Forwarded Ticket (#${ticket.id})`
      );
    });
    if (data != null) {
      for (const ticket of data.entities) {
        socket.on(`ticket-updated-${ticket.id}`, async (status: string) => {
          toast(`Ticket ${ticket.id} is ${status}`, {
            position: "top-right",
            autoClose: 2000,
            progress: 1,
            icon: <BellOutlined style={{ color: "red" }} />,
          });
          updateTicket();
          await refetch();
        });
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
    // ping if user online
    socket.io.on("ping", () => {
      socket.emit("user-online", {
        userId: user?.id,
        activity: USER_STATUS.ONLINE,
      });
    });

    // holiday notifee for Hr
    socket.on(`holiday-created`, async (holiday: Holiday) => {
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
    });

    // complaint notifee for Hr
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

    return () => {
      socket.off(`holiday-created`);
      socket.off(`complainCreated`);
      socket.off("ticket-created");
      socket.off("ticket-forwarded");
      socket.off("received:message");
      if (data != null) {
        for (const ticket of data.entities) {
          socket.off(`messageCreated-${ticket.id}`);
        }
      }
    };
  }, [socket, data]);

  return (
    <div>
      <Switch>
        <Suspense fallback={<Spinner />}>
          <Authinit>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {routes.map((route) => (
                // <Route
                //   key={route.path}
                //   exact={route.exact}
                //   path={`/${route.path}`}
                //   component={route.component}
                // />
                <AdminProtectedRoute
                  user={user}
                  isAuthenticated={!!(isAuthenticated ?? false)}
                  key={route.path}
                  exact={route.exact}
                  path={`/${route.path}`}
                  component={route.component}
                />
              ))}
            </ErrorBoundary>
          </Authinit>
        </Suspense>
        <Redirect from="/" to="/tickets" />
      </Switch>
    </div>
  );
};

export default App;
