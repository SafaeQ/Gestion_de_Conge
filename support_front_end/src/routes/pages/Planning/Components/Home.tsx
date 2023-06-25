import { FC, Fragment, Key, memo, useContext, useState } from "react";
import "./styles/Home.css";
import { transport } from "../../../../util/Api";
import {
  Button,
  DatePicker,
  Popconfirm,
  message,
  Table,
  Card,
  Space,
  Tag,
} from "antd";
import type { ColumnProps } from "antd/lib/table";
import { ROLE, User } from "../../../../types";
import dayjs from "dayjs";
import CellComponent from "./CellComponent";
import {
  DeleteFilled,
  LeftCircleFilled,
  RightCircleFilled,
  SaveFilled,
  SyncOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";
import { getColumnSearchTextProps } from "../../../../util/Filter";
import { FilterConfirmProps } from "antd/lib/table/interface";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { FormShift } from "./FormShift";
import { PlanningType, TimeType, context } from "../context/planningContext";
import { stringify } from "query-string";
import "dayjs/plugin/isoWeek";
import "dayjs/plugin/weekday";

type DataIndex = keyof User;

/** @datePicker attribute */
const { RangePicker } = DatePicker;

const DragDrop: FC = () => {
  const [weekCount, setWeekCount] = useState(0);
  const [days, setDays] = useState(getWeekDays(weekCount));
  // manage state globally
  const { users, planning, setplanning, times, setTimes } = useContext(context);
  const [searchedColumn, setSearchColumn] = useState("");
  const [searchText, setSearchText] = useState("");
  const user = useSelector<RootState, User>((state) => state.auth.user);
  const [ids, setIds] = useState<PlanningType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const queryClient = useQueryClient();

  // save btn
  const savedShiftsMutation = useMutation<unknown, any, PlanningType[]>(
    async (unsavedShifts) => {
      return await transport
        .post("/records", unsavedShifts)
        .then(async (res) => res.data);
    },
    {
      async onSuccess() {
        await queryClient.refetchQueries(["records"]);
        void message.success("Planning is successfully saved");
      },
      onError: async () => {
        await message.error("An error occurred while saving the Planning");
      },
    }
  );

  const savedShifts = () => {
    const unsavedShifts = planning.filter((p) => !p.isSaved);
    savedShiftsMutation.mutate(unsavedShifts);
  };

  // get times data from transport using axios
  useQuery<TimeType[]>(
    "shift",
    async () => {
      return await transport.get<TimeType[]>("/shifts").then((res) => {
        return res.data;
      });
    },
    {
      onSuccess(data) {
        setTimes(data);
      },
    }
  );

  // get the days of the week using moment
  function getWeekDays(week: number) {
    const currentDate = dayjs().weekday(1);
    const weekStart = currentDate
      .clone()
      .add(week * 7, "day")
      .startOf("isoWeek");
    const days = [];
    for (let i = 0; i <= 6; i++) {
      days.push(dayjs(weekStart).add(i, "days").format("YYYY-MM-DD"));
    }
    return days;
  }

  // setting the next week in table
  const nextPage = () => {
    if (weekCount < 3) {
      setWeekCount((next) => {
        setDays(() => getWeekDays(next + 1));
        return next + 1;
      });
    }
  };

  // get the currentWeek
  const currentWeek = () => {
    setWeekCount(0); // reset week count to zero so we can go to next page
    setDays(() => getWeekDays(0));
  };

  // setting the previous week in table
  const prevPage = () => {
    if (weekCount > -20) {
      setWeekCount((prev) => {
        setDays(() => getWeekDays(prev - 1));
        return prev - 1;
      });
    }
  };

  // get get the data and days between to dates
  const getBetweenTwoDates = ([start, end]: [
    string | undefined,
    string | undefined
  ]) => {
    if (Math.abs(dayjs(end).diff(dayjs(start), "days")) > 8) {
      void message.warning("Please select 7 days");
      return;
    }

    const dys = [dayjs(start).format("YYYY-MM-DD")];
    for (let i = 1; i < 7; i++) {
      dys.push(dayjs(start).add(i, "days").format("YYYY-MM-DD"));
    }
    setDays(dys);
  };

  const [START_DATE] = days;
  const END_DATE = days[days.length - 1];
  const ENTITY = user.entity?.id;
  const TEAM = user.team?.id;
  const DEPARTEMENT = user.departements?.map((dep) => dep.id);

  // get shifts data from api using axios
  async function getPlanning() {
    let query = "";

    switch (user?.role) {
      case "TEAMLEADER":
        query = stringify(
          {
            start_date: new Date(START_DATE).toISOString(),
            end_date: new Date(END_DATE).toISOString(),
            entity: user.entity?.id,
            team:
              user.access_planning_teams.length > 0
                ? user.access_planning_teams.map((team) => team)
                : user.team.id,
            departements: user.departements?.map(
              (departement) => departement.id
            ),
          },
          { arrayFormat: "index" }
        );
        break;
      case "TEAMMEMBER":
        query = stringify(
          {
            start_date: new Date(START_DATE).toISOString(),
            end_date: new Date(END_DATE).toISOString(),
            entity: user.entity?.id,
            team: TEAM,
            departements: user.departements?.map(
              (departement) => departement.id
            ),
          },
          { arrayFormat: "index" }
        );
        break;
      case "CHEF":
        query = stringify(
          {
            start_date: new Date(START_DATE).toISOString(),
            end_date: new Date(END_DATE).toISOString(),
            entity: user.entity?.id,
            departements: user.departements?.map(
              (departement) => departement.id
            ),
          },
          { arrayFormat: "index" }
        );
        break;
      default:
        break;
    }
    return await transport
      .get(`/records/init?${query}`)
      .then((res) => res.data);
  }

  const { refetch, isLoading } = useQuery(
    ["records", START_DATE, END_DATE, ENTITY, TEAM, DEPARTEMENT],
    getPlanning,
    {
      // resolve duplicated records
      onSuccess: (records) => {
        setplanning(records);
      },
      enabled: times.length > 0,
      onError: (err) => {
        console.log(err);
        void message.error("Somthing went wrong");
      },
    }
  );

  // delete records
  const { mutate } = useMutation(
    "record-delete",
    async () => {
      // Delete all the shifts
      try {
        if (ids.length !== 0) {
          await transport.delete(`/records/delete`, {
            data: {
              ids,
              start_date: new Date(START_DATE).toISOString(),
              end_date: new Date(END_DATE).toISOString(),
            },
          });
          setplanning([]);
          setSelectedRowKeys([]);
          return;
        }
      } catch (error) {
        console.log(error);
        await message.error("Something went wrong");
        throw error;
      }
    },
    {
      onSuccess: async () => {
        void refetch();
        void message.success("Shifts are deleted successfully");
      },
    }
  );
  const deleteRecords = () => {
    mutate();
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchColumn(dataIndex);
  };

  const handleReset = (clearFilters: (() => void) | undefined) => {
    if (clearFilters != null) clearFilters();
    setSearchText("");
  };

  const childs: any = days.map((day, i) => ({
    title: dayjs(day).format("dddd"),
    children: [
      {
        title: day,
        render: (usr: User) => {
          return (
            <CellComponent
              key={i}
              boxDay={i}
              user={usr}
              day={day}
              planning={planning}
            />
          );
        },
      },
    ],
    dataIndex: "date",
    width: 156,
  }));

  const datacolumn: Array<ColumnProps<User>> = [
    {
      title: "Users",
      dataIndex: "",
      ...getColumnSearchTextProps("name", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      render: (user) => (
        <Space
          style={{
            width: "100%",
            border: "none",
            display: "flex",
            justifyContent: "left",
            alignItems: "center",
            fontWeight: user.role === ROLE.CHEF ? "bold" : 500,
            backgroundColor:
              user.role === ROLE.CHEF ? "#d8e2dc" : user.team.color,
            justifyItems: "center",
          }}
        >
          {user.role === ROLE.CHEF ? null : (
            <Tag
              icon={<TeamOutlined />}
              style={{
                border: "none",
                fontSize: "1rem",
                backgroundColor: user.team.color,
                justifyItems: "center",
              }}
            >
              {user.team.name}
            </Tag>
          )}
          <Tag
            icon={<UserOutlined color="white" />}
            style={{
              width: "100%",
              border: 1,
              fontSize: "1rem",
              padding: 12,
              fontWeight: user.role === ROLE.CHEF ? "bold" : 500,
              backgroundColor:
                user.role === ROLE.CHEF ? "#d8e2dc" : user.team.color,
              justifyItems: "center",
            }}
          >
            {user.name}
          </Tag>
        </Space>
      ),
    },
    {
      children: childs,
    },
  ];
  const cancel = () => {
    void message.error("Canceled");
  };
  const reload = () => {
    void refetch();
  };

  const isSelected = selectedRowKeys.length !== 0;

  return (
    <>
      <div className={user.role !== ROLE.TEAMMEMBER ? "main" : undefined}>
        <div className="item">
          {[ROLE.TEAMLEADER, ROLE.CHEF].includes(user?.role) ? (
            <div className="divs w-75 p-3">
              <FormShift times={times} />
            </div>
          ) : null}
        </div>
        <div className="home">
          <div style={{ position: "absolute" }}>
            {user.role === ROLE.CHEF ? (
              isSelected ? (
                <Popconfirm
                  title="Are you sure to Delete this planning?"
                  onConfirm={deleteRecords}
                  onCancel={cancel}
                  okText="Yes"
                  cancelText="No"
                  icon={<DeleteFilled style={{ color: "red" }} />}
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<DeleteFilled style={{ color: "red" }} />}
                    style={{
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "4.6%",
                      position: "fixed",
                      padding: 20,
                      bottom: 110,
                      right: 30,
                      marginLeft: 20,
                      zIndex: 999,
                    }}
                    disabled={!isSelected}
                  />
                </Popconfirm>
              ) : null
            ) : null}
          </div>

          <Card
            extra={[
              <Fragment key={1}>
                {[ROLE.TEAMLEADER, ROLE.CHEF].includes(user?.role) ? (
                  <Popconfirm
                    title="Are you sure to Save this planning?"
                    onConfirm={savedShifts}
                    onCancel={cancel}
                    okText="Yes"
                    cancelText="No"
                    icon={<SaveFilled style={{ color: "#1677ff" }} />}
                  >
                    <Button
                      loading={savedShiftsMutation.isLoading}
                      className="publishBtn"
                      icon={<SaveFilled style={{ color: "#fff" }} />}
                    >
                      Save
                    </Button>
                  </Popconfirm>
                ) : null}
                <Button
                  onClick={reload}
                  loading={isLoading}
                  className="refrechBtn"
                  icon={
                    <SyncOutlined
                      spin={isLoading}
                      style={{ color: "#1677ff" }}
                    />
                  }
                >
                  Refresh
                </Button>
                <RangePicker
                  value={[dayjs(days[0]), dayjs(days[days.length - 1])]}
                  onChange={(values) => {
                    if (values != null) {
                      const start = values[0];
                      const end = values[1];
                      getBetweenTwoDates([
                        start?.format("YYYY-MM-DD"),
                        end?.format("YYYY-MM-DD"),
                      ]);
                    }
                  }}
                />

                <Space key={0}>
                  <Button
                    className="prevBtn"
                    onClick={prevPage}
                    icon={<LeftCircleFilled style={{ color: "#1677ff" }} />}
                  >
                    Previous
                  </Button>
                  <Button className="nextBtn" onClick={currentWeek}>
                    Current
                  </Button>
                  <Button
                    className="nextBtn"
                    onClick={nextPage}
                    icon={<RightCircleFilled style={{ color: "#1677ff" }} />}
                  >
                    Next
                  </Button>
                </Space>
              </Fragment>,
            ]}
            bodyStyle={{ lineHeight: 6 }}
          >
            <Table
              columns={datacolumn}
              rowKey={(records) => records.id}
              dataSource={users}
              loading={isLoading}
              rowSelection={
                user.role === ROLE.CHEF
                  ? {
                      onChange: (selectedRowKeys, selectedRows: User[]) => {
                        setSelectedRowKeys(selectedRowKeys);
                        const selectedPlanningIds = planning
                          .filter((p) => {
                            return selectedRowKeys.includes(p.user.id);
                          })
                          .map((pl) => pl.id);
                        setIds(selectedPlanningIds as unknown as []);
                      },
                      selectedRowKeys,
                    }
                  : undefined
              }
              bordered
              size="small"
              pagination={false}
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default memo(DragDrop);
