/* eslint-disable @typescript-eslint/no-var-requires */
import { Card, Typography } from "antd";
import "./index.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { transport } from "../../../util/Api";
import { useQuery } from "react-query";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function index() {
  const { Title } = Typography;

  // get number global of users
  const { data: userCount } = useQuery(
    "users-count",
    async () => await transport.get("/users/count").then((res) => res.data)
  );

  // get number global of departements
  // const { data: departementCount } = useQuery(
  //   "departements",
  //   async () =>
  //     await transport.get("/departements/count").then((res) => res.data)
  // );

  // get number global of entities
  // const { data: entityCount } = useQuery(
  //   "entities",
  //   async () => await transport.get("/entities/count").then((res) => res.data)
  // );

  // // get number global of teams
  // const { data: teamCount } = useQuery(
  //   "teams",
  //   async () => await transport.get("/teams/count").then((res) => res.data)
  // );

  // // get number global of shifts
  // const { data: shiftCount } = useQuery(
  //   "shifts",
  //   async () => await transport.get("/shifts/count").then((res) => res.data)
  // );

  // // get number global of tickets
  // const { data: ticketCount } = useQuery(
  //   "tickets",
  //   async () => await transport.get("/tickets/count").then((res) => res.data)
  // );

  // const data = {
  //   labels: ["Users", "Departements", "Entities", "Teams", "Shifts"],
  //   datasets: [
  //     {
  //       label: "Data",
  //       data: [userCount, departementCount, entityCount, teamCount, shiftCount],
  //       fill: true,
  //       backgroundColor: "#cdf8f3 ",
  //       borderColor: "#37f5e1  ",
  //     },
  //   ],
  // };

  const ticketsData = {
    labels: [dayjs().local().month()],
    // .map((i) => [i])
    datasets: [
      {
        label: "Tickets",
        data: [33, 53, 85, 41, 44, 65, 100, 0, 53, 85, 41, 110],
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  return (
    <div className="body-dashboard">
      <div className="bodyGlass">
        <div className="mainDash">
          <Title level={2}>Dashboard</Title>
          <div className="Cards">
            <div style={{ display: "flex", gap: "25px" }}>
              <div className="card-data">
                <Card
                  style={{
                    height: "6rem",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px" }}>
                    <UserOutlined
                      style={{ width: "12px" }}
                      className="anticon-user"
                    />
                    <div>
                      <Title> {userCount} </Title>
                      <p>Number Global of Users </p>
                    </div>
                  </div>
                </Card>
              </div>
              {/* <div className='card-data'>
                <Card style={{ height: '6rem' }}>GlobalGuard</Card>
              </div>
              <div className='card-data'>
                <Card style={{ height: '6rem' }}>GlobalGuard</Card>
              </div>
              <div className='card-data'>
                <Card style={{ height: '6rem' }}>GlobalGuard</Card>
              </div> */}
            </div>
            <div className="parentContainer">
              <Card className="cardDash">
                <Line
                  data={ticketsData}
                  title="Number Global of tickets per month"
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
