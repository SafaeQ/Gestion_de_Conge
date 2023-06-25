import {
  Alert,
  Badge,
  BadgeProps,
  Button,
  Calendar,
  Card,
  DatePicker,
  Popconfirm,
  Popover,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import React, { useState } from "react";
import "../style/holidayStyle.css";
import NewRequest from "./NewRequest";
import { useMutation, useQuery } from "react-query";
import { transport } from "../../../../util/Api";
import {
  DaysOff,
  Holiday,
  REQUEST_HOLIDAY_STATUS,
  ROLE,
  User,
} from "../../../../types";
import { ColumnProps } from "antd/lib/table";
import dayjs from "dayjs";
import {
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";
import { FilterConfirmProps } from "antd/lib/table/interface";
import {
  getColumnSearchOneDepthObjectProps,
  getColumnSearchTextProps,
} from "../../../../util/Filter";
import type { CellRenderInfo } from "rc-picker/lib/interface";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

type DataIndex = keyof Holiday;

const RHome = () => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState<number>(0);
  const [dataHoliday, setData] = useState<Holiday[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");
  const [loading, setLoading] = useState({ key: 0, load: false, type: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs | null>(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  // get all requests of holidays
  const { isLoading, refetch } = useQuery<Holiday[]>(
    "All-holidays",
    async () => {
      return await transport.get("/holidays").then((res) => res.data);
    },
    {
      enabled: user?.role === ROLE.ADMIN,
      onSuccess: (data) => {
        setData(data);
        setDate(0);
      },
    }
  );

  const { data: users } = useQuery<User[]>("users", async () => {
    return await transport.get("users").then((res) => res.data);
  });

  const { data: Dates } = useQuery<DaysOff[]>("days-off", async () => {
    return await transport.get("/holidays/dates").then((res) => res.data);
  });

  // filtring data by dates
  useQuery<{ data: Holiday[] }>(
    "holiday-dates",
    async () => {
      return await transport
        .post("/holidays/filter", { date })
        .then((res) => res.data);
    },
    {
      enabled: date !== 0 && date !== null,
      onSuccess: (data) => {
        setData(data.data);
        setDate(0);
      },
      onError(err) {
        console.log("err!", err);
      },
    }
  );

  // update status of the holiday req
  const updateStatusMutation = useMutation(
    async ({ id, status }: { id: number; status: string }) =>
      await transport
        .put(`/holidays/status/update/`, {
          id,
          status,
        })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        void message.success("Status Updated Succesfully");
        void refetch();
      },
      onError: async () => {
        void message.error("Error Updating");
      },
    }
  );

  // post confirmation from HR
  const { mutate: mutateStatus } = useMutation(
    async ({
      id,
      isOkByHr,
      isOkByChef,
      isRejectByHr,
      isRejectByChef,
      userId,
    }: {
      id: number;
      isOkByHr: boolean;
      isOkByChef: boolean;
      isRejectByHr: boolean;
      isRejectByChef: boolean;
      userId: number;
    }) => {
      return await transport.put(`/holidays/status/approved/${id}`, {
        isOkByHr,
        isOkByChef,
        isRejectByHr,
        isRejectByChef,
        userId,
      });
    },
    {
      onSuccess: async () => {
        void message.success("Confirmation By HR is done");
        void refetch();
      },
      onError: async () => {
        void message.error("Error Updating");
      },
    }
  );

  // cancel req and return the total of dates to solde
  const { mutate: mutateStatusCancel } = useMutation(
    async ({ id, userId }: { id: number; userId: number }) => {
      return await transport.put(`/holidays/status/cancel/${id}`, {
        userId,
      });
    },
    {
      onSuccess: async () => {
        void message.success("cancel");
        void refetch();
      },
      onError: async () => {
        void message.error("Error Updating");
      },
    }
  );

  //* Filter the data based on the selected month
  const handleDateRangeChange = (date: dayjs.Dayjs) => {
    setSelectedMonth(date);
  };

  const filteredData = selectedMonth
    ? dataHoliday.filter((item) => {
        const itemMonth = dayjs(item.from).month();
        const selectedMonthValue = selectedMonth.month();
        return itemMonth === selectedMonthValue;
      })
    : dataHoliday;

  //  display the status of a holiday request
  function requestStatus(status: REQUEST_HOLIDAY_STATUS) {
    const statusColors = {
      [REQUEST_HOLIDAY_STATUS.Approve]: "green",
      [REQUEST_HOLIDAY_STATUS.Open]: "blue",
      [REQUEST_HOLIDAY_STATUS.Reject]: "red",
      [REQUEST_HOLIDAY_STATUS.Cancel]: "grey",
    };

    return <Tag color={statusColors[status]}>{status}</Tag>;
  }

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

  const isAuthorized = user?.role === ROLE.ADMIN || user?.role === ROLE.CHEF;

  const columns: Array<ColumnProps<Holiday>> = [
    {
      title: "Id",
      key: "id",
      dataIndex: "id",
      ...getColumnSearchTextProps("id", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      render: (_, record) =>
        isAuthorized ? (
          <Link to={`/holidays/tech/update/${record.id}`}>{record.id}</Link>
        ) : (
          record.id
        ),
    },
    {
      title: "User",
      dataIndex: "user",
      ...getColumnSearchOneDepthObjectProps("user", "name", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      render: (_, record) => (
        <>{record.user.id === user?.id ? "You" : record.user.name}</>
      ),
    },
    {
      title: "Notes",
      key: "notes",
      dataIndex: "notes",
      render: (_, record) => (
        <Popover content={record.notes} trigger="focus">
          <Button
            shape="circle"
            style={{ borderBlockColor: "#3498db", color: "#3498db" }}
            icon={<FileTextOutlined />}
          />
        </Popover>
      ),
    },
    {
      title: "From",
      key: "from",
      dataIndex: "from",
      render: (_, record) => dayjs(record.from).format("YYYY-MM-DD"),
    },

    {
      title: "To",
      key: "to",
      dataIndex: "to",
      render: (_, record) => dayjs(record.to).format("YYYY-MM-DD"),
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, record) =>
        dayjs(record.to).add(1, "day").diff(dayjs(record.from), "day"),
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      defaultFilteredValue: [
        REQUEST_HOLIDAY_STATUS.Open,
        REQUEST_HOLIDAY_STATUS.Approve,
        REQUEST_HOLIDAY_STATUS.Reject,
        REQUEST_HOLIDAY_STATUS.Cancel,
      ],
      filters: [
        {
          text: REQUEST_HOLIDAY_STATUS.Open,
          value: REQUEST_HOLIDAY_STATUS.Open,
        },
        {
          text: REQUEST_HOLIDAY_STATUS.Approve,
          value: REQUEST_HOLIDAY_STATUS.Approve,
        },
        {
          text: REQUEST_HOLIDAY_STATUS.Reject,
          value: REQUEST_HOLIDAY_STATUS.Reject,
        },
        {
          text: REQUEST_HOLIDAY_STATUS.Cancel,
          value: REQUEST_HOLIDAY_STATUS.Cancel,
        },
      ],
      onFilter: (value, record) =>
        record.status.indexOf(value as REQUEST_HOLIDAY_STATUS) === 0,

      render: (_, record) => requestStatus(record.status),
    },
    {
      title: "Balance",
      key: "user",
      dataIndex: "user",
      render: (_: any, record: { user: { solde: number } }) =>
        record.user.solde,
    },
    {
      title: "Created By",
      key: "createdBy",
      dataIndex: "createdBy",
      render: (_, record) =>
        record.user.id === user?.id ? "You" : record.createdBy,
    },
    {
      title: "Date",
      key: "createAt",
      dataIndex: "createAt",
      render: (_, record) =>
        dayjs(record.createdAt).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Updates",
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (_, record) =>
        dayjs(record.updatedAt).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <>
            <Tooltip title="Confirm by HR" color="geekblue">
              <Popconfirm
                title="Approve the Holiday"
                description="Are you sure to Approve this holiday?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => {
                  setLoading({ key: record.id, load: true, type: "APPROVE" });
                  if (record.status !== REQUEST_HOLIDAY_STATUS.Approve) {
                    mutateStatus(
                      {
                        id: record.id,
                        isOkByHr: true,
                        isOkByChef: record.isOkByChef,
                        isRejectByHr: false,
                        isRejectByChef: false,
                        userId: record.user.id,
                      },
                      {
                        onSuccess: () => {
                          setLoading({
                            key: record.id,
                            load: false,
                            type: "APPROVE",
                          });
                        },
                      }
                    );
                  } else {
                    if (record.status === REQUEST_HOLIDAY_STATUS.Approve) {
                      void message.info("Status already Approved");
                    }
                    setLoading({
                      key: record.id,
                      load: false,
                      type: "APPROVE",
                    });
                  }
                }}
              >
                <Button
                  shape="circle"
                  icon={<CheckOutlined />}
                  className="approved"
                  loading={
                    loading.key === record.id &&
                    loading.load &&
                    loading.type === REQUEST_HOLIDAY_STATUS.Approve
                  }
                />
              </Popconfirm>
            </Tooltip>
            <Tooltip title="Reject" color="geekblue">
              <Popconfirm
                title="Reject the task"
                description="Are you sure to Reject this task?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => {
                  if (
                    record.status !== REQUEST_HOLIDAY_STATUS.Reject &&
                    record.status === REQUEST_HOLIDAY_STATUS.Open
                  ) {
                    setLoading({ key: record.id, load: true, type: "REJECT" });
                    mutateStatus(
                      {
                        id: record.id,
                        isOkByHr: false,
                        isOkByChef: false,
                        isRejectByHr: true,
                        isRejectByChef: record.isRejectByChef,
                        userId: record.user.id,
                      },
                      {
                        onSuccess: () => {
                          setLoading({
                            key: record.id,
                            load: false,
                            type: "APPROVE",
                          });
                        },
                      }
                    );
                  } else if (record.status === REQUEST_HOLIDAY_STATUS.Cancel) {
                    void message.info(
                      "The request is canceled you cannot update it to status Reject",
                      5
                    );
                  } else if (record.status === REQUEST_HOLIDAY_STATUS.Approve) {
                    void message.info(
                      "The request is Approved you cannot update it to status Reject",
                      5
                    );
                  } else {
                    void message.info("Status already Rejected");
                  }
                }}
              >
                <Button
                  shape="circle"
                  icon={<CloseOutlined />}
                  className="reject-btn"
                  loading={
                    loading.key === record.id &&
                    loading.load &&
                    loading.type === REQUEST_HOLIDAY_STATUS.Reject
                  }
                />
              </Popconfirm>
            </Tooltip>
          </>
          <Tooltip title="Cancel" color="geekblue">
            <Popconfirm
              title="Cancel the Holiday"
              description="Are you sure to cancel this holiday?"
              okText="Yes"
              onConfirm={() => {
                if (record.status === REQUEST_HOLIDAY_STATUS.Approve) {
                  setLoading({ key: record.id, load: true, type: "CANCEL" });
                  // update solde
                  mutateStatusCancel(
                    {
                      id: record.id,
                      userId: record.user.id,
                    },
                    {
                      onSuccess: () => {
                        setLoading({
                          key: record.id,
                          load: false,
                          type: "CANCEL",
                        });
                      },
                    }
                  );
                } else if (record.status === REQUEST_HOLIDAY_STATUS.Cancel) {
                  void message.info("Status already is Cancel");
                } else {
                  updateStatusMutation.mutate(
                    {
                      status: REQUEST_HOLIDAY_STATUS.Cancel,
                      id: record.id,
                    },
                    {
                      onSuccess: () => {
                        setLoading({
                          key: record.id,
                          load: false,
                          type: "CANCEL",
                        });
                      },
                    }
                  );
                }
              }}
              cancelText="No"
            >
              <Button
                shape="circle"
                icon={<ExclamationCircleOutlined />}
                className="cancel-btn"
                loading={
                  loading.key === record.id &&
                  loading.load &&
                  loading.type === REQUEST_HOLIDAY_STATUS.Cancel
                }
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // search users
  const handleUserSearch = (value: string) => {
    setSearchQuery(value);
  };

  // select users
  const handleUserSelect = (value: string, option: any) => {
    setSearchQuery(value);
    setUserId(option?.key);
  };

  const filteredDataHoliday = dataHoliday?.filter((item) =>
    item.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getListData = (value: dayjs.Dayjs) => {
    const listData = [];
    const dates = Dates?.find((d) =>
      dayjs(value).isSame(dayjs(d.date), "dates")
    );
    const result = dataHoliday.find((holiday) => {
      return (
        dayjs(value).isBetween(
          dayjs(holiday.from),
          dayjs(holiday.to),
          "date",
          "[]"
        ) &&
        holiday.status === REQUEST_HOLIDAY_STATUS.Approve &&
        holiday.user.id === userId
      );
    });

    if (result) {
      listData.push({ type: "success", content: "Holiday" });
    }

    if (dates) {
      listData.push({ type: "info", content: dates.name });
    }

    return listData;
  };

  const dateCellRender = (value: dayjs.Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.content}>
            <Badge
              status={item.type as BadgeProps["status"]}
              text={item.content}
              style={
                item.type === "success"
                  ? {
                      backgroundColor: "#52c41a",
                      width: "100%",
                      padding: 5,
                    }
                  : {
                      backgroundColor: "#7ecaf2",
                      width: "100%",
                      padding: 5,
                    }
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender = (
    current: dayjs.Dayjs,
    info: CellRenderInfo<dayjs.Dayjs>
  ) => {
    if (info.type === "date") return dateCellRender(current);
    return info.originNode;
  };

  return (
    <div>
      <div style={{ margin: 12, width: "80%" }}>
        <Alert
          message="Annual Leave"
          description={
            <ul>
              <li>
                The minimum duration between one leave and another must be equal
                to or greater than 6 months.
              </li>
              <li>
                Any leave request must be submitted at least one week before the
                employee&apos;s departure.
              </li>
              <li>
                All leave requests must be approved by the supervisor and HR
                Manager prior to the employee&apos;s release.
              </li>
            </ul>
          }
          type="warning"
          showIcon
          closable
        />
      </div>
      <Card
        extra={[
          <Button
            icon={<PlusCircleOutlined />}
            key={1}
            onClick={showModal}
            className="req-btn"
          >
            New Request
          </Button>,
          <NewRequest
            key={2}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            dataHoliday={dataHoliday}
            refetch={refetch}
          />,
          <Space key={5}>
            <Select
              showSearch
              placeholder="Select a person"
              optionFilterProp="children"
              onSearch={handleUserSearch}
              onSelect={handleUserSelect}
              onClear={() => {
                void refetch();
                setUserId(undefined);
                setSearchQuery("");
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
              options={users?.map((item) => {
                return {
                  label: item.name,
                  value: item.name,
                  key: item.id,
                };
              })}
              style={{ width: 200 }}
            />
          </Space>,
          <Space key={6}>
            <DatePicker
              key={3}
              onChange={(dates) => {
                handleDateRangeChange(dates as dayjs.Dayjs);
              }}
              picker="month"
              allowClear
            />
          </Space>,
        ]}
      >
        <Table
          bordered={true}
          rowKey={(record) => record.id}
          loading={isLoading}
          columns={columns}
          dataSource={
            selectedMonth
              ? filteredData
              : searchQuery
              ? filteredDataHoliday
              : dataHoliday
          }
        />
      </Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBlock: 12,
          marginBottom: "2.5%",
        }}
      >
        <div
          style={{
            height: "50%",
            boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
          }}
        >
          <Calendar style={{ height: "50%" }} cellRender={cellRender} />
        </div>
      </div>
    </div>
  );
};

export default RHome;
