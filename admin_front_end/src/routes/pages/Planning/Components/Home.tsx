import { FC, Fragment, Key, memo, useContext, useState } from "react";
import "./styles/Home.css";
import { transport } from "../../../../util/Api";
import { ROLE, User } from "../../../../types";
import dayjs from "dayjs";
import "../../../../assets/style/styling.css";
import CellComponent from "./CellComponent";
import {
  EntityPlanning,
  PlanningType,
  TimeType,
  context,
} from "../context/planningContext";
import {
  Button,
  DatePicker,
  Popconfirm,
  message,
  Table,
  Card,
  Typography,
  Space,
  Tag,
} from "antd";
import type { ColumnProps } from "antd/lib/table";
import {
  DeleteFilled,
  LeftCircleFilled,
  RightCircleFilled,
  SaveFilled,
  SyncOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FilterConfirmProps } from "antd/lib/table/interface";
import { getColumnSearchTextProps } from "../../../../util/Filter";
import { useMutation, useQuery } from "react-query";
import { FormShift } from "./FormShift";
import "dayjs/plugin/isoWeek";
import "dayjs/plugin/weekday";

/** @datePicker attribute */
const { RangePicker } = DatePicker;

const { Title } = Typography;
type DataIndex = keyof User;

const DragDrop: FC = () => {
  const [weekCount, setWeekCount] = useState(0);
  const [days, setDays] = useState(getWeekDays(weekCount));
  // manage state globally
  const { entities, planning, setplanning, times, setTimes } =
    useContext(context);
  const [searchedColumn, setSearchColumn] = useState("");
  const [searchText, setSearchText] = useState("");
  const [START_DATE] = days;
  const END_DATE = days[days.length - 1];
  const [ids, setIds] = useState<PlanningType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

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

  const { refetch, isLoading } = useQuery(
    ["records", START_DATE, END_DATE],
    async () => {
      return await transport
        .get(
          `/records/init?start_date=${new Date(
            START_DATE
          ).toISOString()}&end_date=${new Date(END_DATE).toISOString()}`
        )
        .then((res) => res.data);
    },
    // resolve duplicated records
    {
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

  // save btn
  const savedShiftsMutation = useMutation<unknown, any, PlanningType[]>(
    async (unsavedShifts) => {
      return await transport
        .post("/records", unsavedShifts)
        .then(async (res) => res.data);
    },
    {
      async onSuccess() {
        await refetch();
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

  // search by name of users
  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchColumn(dataIndex);
  };

  // search by name of entity
  const handleSearchEntity = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: keyof EntityPlanning
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchColumn(dataIndex);
  };

  const handleReset = (clearFilters: (() => void) | undefined) => {
    if (clearFilters != null) clearFilters();
    setSearchText("");
  };

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
  const canceled = () => {
    void message.error("Canceled");
  };

  // cell of table
  const childs: any = days.map((day, i) => ({
    title: dayjs(day).format("dddd"),
    children: [
      {
        title: day,
        render: (user: User) => {
          return <CellComponent key={i} boxDay={i} user={user} day={day} />;
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
              user.role === ROLE.CHEF ? "#d8e2dc" : user.team?.color,
            justifyItems: "center",
          }}
        >
          {user.role === ROLE.CHEF ? null : (
            <Tag
              icon={<TeamOutlined />}
              style={{
                border: "none",
                fontSize: "1rem",
                backgroundColor: user.team?.color,
                justifyItems: "center",
              }}
            >
              {user.team?.name}
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
                user.role === ROLE.CHEF ? "#d8e2dc" : user.team?.color,
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

  const datacolumn2: Array<ColumnProps<EntityPlanning>> = [
    {
      title: "Entities",
      dataIndex: "name",
      ...getColumnSearchTextProps("name", {
        handleReset,
        handleSearch: handleSearchEntity,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      align: "center",
      className: "ant-table-column-title-span",
      render: (name) => (
        <Tag style={{ width: "100%", padding: 0, margin: 0 }}>
          <Title
            level={4}
            type="warning"
            style={{ display: "flex", justifyContent: "center", margin: 6 }}
          >
            {name}
          </Title>
        </Tag>
      ),
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
      <div className="main">
        <div className="item">
          <div className="divs w-75 p-3">
            <FormShift times={times} />
          </div>
        </div>
        <div className="page">
          <div style={{ position: "absolute" }}>
            {isSelected ? (
              <Popconfirm
                title="Are you sure to Delete this planning?"
                onConfirm={deleteRecords}
                onCancel={canceled}
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
            ) : null}
          </div>
          <Card
            extra={[
              <Fragment key={1}>
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

                <Button
                  onClick={reload}
                  loading={isLoading}
                  className="refrechBtn"
                  icon={<SyncOutlined style={{ color: "#1677ff" }} />}
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
              columns={datacolumn2}
              rowKey="id"
              loading={isLoading}
              expandable={{
                expandedRowRender: (record) => (
                  <Table
                    columns={datacolumn}
                    rowKey="id"
                    dataSource={record.users}
                    bordered
                    rowSelection={{
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
                    }}
                    loading={isLoading}
                    size="small"
                    pagination={false}
                  />
                ),
                defaultExpandAllRows: true,
              }}
              dataSource={entities}
              pagination={false}
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default memo(DragDrop);
