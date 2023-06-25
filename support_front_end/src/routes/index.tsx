import { lazy, Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Redirect, Switch } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import { RootState } from "../appRedux/store";
import useSound from "use-sound";
import Authinit from "../containers/Auth/Authinit";
import ProtectedRoute from "../containers/hoc/PrivateRoute";
import TeamLeaderProtectedRoute from "../containers/hoc/PrivateRoute2";
import Spinner from "../containers/Spinner";
import {
  Chat,
  Complaints,
  Holiday,
  IqueryParams,
  ROLE,
  Ticket,
  User,
  USER_STATUS,
} from "../types";
import DragDrop from "./pages/Planning/Components/Home";

import Provider from "./pages/Planning/context/planningContext";
import { Button, Result } from "antd";
import addNotification from "react-push-notification";
import { socket } from "../context/socket.provider";
import { useNotification } from "../util/useNotification";
import pointBlank from "../sounds/point-blank-589.mp3";
import ChefProtectedRoute from "../containers/hoc/ChefPrivateRoute";
import Create from "./pages/Sponsors/Create";
import Update from "./pages/Sponsors/Update";
import { transport } from "../util/Api";
import { useQuery } from "react-query";
import { toast } from "react-toastify";
import { BellOutlined } from "@ant-design/icons";
import inform from "../sounds/youve-been-informed-345.mp3";
import UpdateComplain from "./pages/Tickets/Complaints/Update";

const Tickets = lazy(async () => await import("./pages/Tickets/Tickets"));
const Sponsors = lazy(async () => await import("./pages/Sponsors/Sponsors"));
const ChatApp = lazy(async () => await import("./pages/Chat"));
const HolidayComponent = lazy(
  async () => await import("./pages/HolidayManagement/Components/HolidayHome")
);

const Planning = () => {
  return (
    <Provider>
      <DragDrop />
    </Provider>
  );
};

enum Scoop {
  MEMBER = "member",
  LEADER = "leader",
  CHEF = "chef",
}

// define application routes
const routes = [
  {
    component: Tickets,
    path: "tickets",
    exact: true,
    scope: Scoop.MEMBER,
  },
  {
    component: ChatApp,
    path: "chats",
    exact: true,
    scope: Scoop.LEADER,
  },
  {
    component: Planning,
    path: "planning",
    exact: true,
    scope: Scoop.MEMBER,
  },
  {
    component: Sponsors,
    path: "sponsors",
    exact: true,
    scope: Scoop.CHEF,
  },
  {
    component: Create,
    path: "sponsors/create",
    exact: true,
    scope: Scoop.CHEF,
  },
  {
    component: Update,
    path: "sponsors/:id/edit",
    exact: true,
    scope: Scoop.CHEF,
  },
  {
    component: HolidayComponent,
    path: "holiday-management",
    exact: true,
    scope: Scoop.MEMBER,
  },
  {
    component: UpdateComplain,
    path: "complaints/edit/:id",
    exact: true,
  },
  // {
  //   component: UpdateRequest,
  //   path: "holidays/tech/update/:id",
  //   exact: true,
  //   scope: Scoop.ADMIN,
  // },
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

    // notife for chef according to thier entity
    if (user?.role === ROLE.CHEF) {
      socket.on(`holiday-created-tech`, async (holiday: Holiday) => {
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
            `complainSeen-tech-${complaint.user.id}-${complaint.id}`,
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
        socket.off(`holiday-created-tech`);
      }
      socket.off("ticket-created");
      socket.off("ticket-forwarded");
      socket.off("received:message");
      if (data != null) {
        for (const ticket of data.entities) {
          socket.off(`messageCreated-${ticket.id}`);
        }
      }
      if (Complaints != null) {
        for (const complaint of Complaints) {
          socket.off(`complainSeen-tech-${complaint.user.id}-${complaint.id}`);
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
              {routes.map((route) => {
                if (route.scope === Scoop.MEMBER) {
                  return (
                    <ProtectedRoute
                      user={user}
                      isAuthenticated={!!(isAuthenticated ?? false)}
                      key={route.path}
                      exact={route.exact}
                      path={`/${route.path}`}
                      component={route.component}
                    />
                  );
                }
                if (route.scope === Scoop.CHEF) {
                  return (
                    <ChefProtectedRoute
                      user={user}
                      isAuthenticated={!!(isAuthenticated ?? false)}
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
                    isAuthenticated={!!(isAuthenticated ?? false)}
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
