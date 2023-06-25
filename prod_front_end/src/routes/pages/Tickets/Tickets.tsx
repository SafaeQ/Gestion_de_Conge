import {
  AlertOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CommentOutlined,
  DiffOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  FolderFilled,
  ForwardOutlined,
  PushpinFilled,
  PushpinOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Button,
  Table,
  Card,
  Tag,
  Space,
  Badge,
  Popover,
  message,
  Popconfirm,
  Tabs,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import { FilterConfirmProps } from "antd/lib/table/interface";
import { Key, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import useSound from "use-sound";
import { useSelector } from "react-redux";
import {
  Complaints,
  IqueryParams,
  ROLE,
  Ticket,
  TICKET_SEVERITY,
  TICKET_STATUS,
  User,
} from "../../../types";
import { transport } from "../../../util/Api";
import {
  getColumnSearchOneDepthObjectProps,
  getColumnSearchTextProps,
} from "../../../util/Filter";
import dayjs from "dayjs";
import Create from "./Create";
import forSure from "../../../sounds/for-sure-576.mp3";
import inform from "../../../sounds/youve-been-informed-345.mp3";
import { RootState } from "../../../appRedux/store";
import { socket } from "../../../context/socket.provider";
import addNotification from "react-push-notification";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Tab } from "rc-tabs/lib/interface";
import Forward from "./Forward";
import { toast } from "react-toastify";
import ChatDrawer from "./Conversation/conversationIndex";
import Complaint from "./Complaints/Complaint";
import CreateComplaint from "./Complaints/Create";

type DataIndex = keyof Ticket;

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs().tz("Africa/Casablanca");

const Tickets = () => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  const [messageSound] = useSound(forSure);
  const [updateTicket] = useSound(inform);
  const [ticketId, setTicketID] = useState<number | null>(null);
  const [isForwardVisible, setIsForwardVisible] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [isPostVisible, setIsPostVisible] = useState(false);
  const [searchedColumn, setSearchColumn] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [pin, setPin] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number>(0);
  const [recordTicket, setRecordTicket] = useState<Ticket | null>(null);
  const [openModel, setOpenModel] = useState(false);

  /* Setting the filter object based on the user role. */
  let filter: IqueryParams["filter"] = {};
  if (user != null && user.role === "TEAMMEMBER") {
    filter = {
      user: {
        id: user.id,
      },
    };
  } else if (user != null && user.role === "TEAMLEADER") {
    filter = {
      issuer_team: {
        id: user.team.id,
      },
      entity: {
        id: user.entity.id,
      },
    };
  } else if (user != null && user.role === "CHEF") {
    filter = {
      entity: {
        id: user.entity.id,
      },
    };
  }

  /* Setting the initial state of the queryParams object. */
  const [queryParams, setQueryParams] = useState<IqueryParams>({
    access_entity: user?.access_entity ?? [],
    access_team: user?.access_team ?? [],
    filter,
    pageNumber: 1,
    pageSize: 10,
    read: user?.id ?? 0,
    typeUser: user?.user_type,
    sortField: "updatedAt",
    sortOrder: "desc",
  });

  /* A hook that is used to fetch data from the server. */
  const { data, refetch, isLoading } = useQuery<{
    entities: Ticket[];
    totalCount: number;
  }>(
    ["tickets", setQueryParams],
    async () =>
      await transport
        .post("/tickets/global/find", { queryParams })
        .then((res) => res.data),
    {
      refetchInterval: 3000,
    }
  );

  const {
    data: Complaints,
    isLoading: isLoadingData,
    refetch: refetchData,
  } = useQuery<Complaints[]>(
    "Complaints-by-entity",
    async () =>
      await transport
        .post("/complaints/chef", { id: user?.id })
        .then((res) => res.data)
  );

  const updateMutation = useMutation<
    any,
    unknown,
    { ids: Key[]; status: TICKET_STATUS }
  >(
    async ({ ids, status }) =>
      await transport
        .post(`/tickets/updateStatusForTickets`, {
          ids,
          closed_by: user?.name,
          resolved_by: user?.name,
          status,
          assigned_to: user?.id ?? null,
        })
        .then((res) => res.data),
    {
      onSuccess: () => {
        void refetch();
        socket.emit("bulkUpdatedTicket", selectedRowKeys);
        setSelectedRowKeys([]);
        void message.success(`Tickets has been updated.`);
      },
      onError: () => {
        void message.error("Error Updating");
      },
    }
  );

  const pinMutation = useMutation<any, unknown, { id: number }>(
    async (id) => {
      await transport
        .post(`/tickets/pinned`, {
          id,
          pinned: pin,
        })
        .then((res) => res.data);
    },
    {
      onSuccess: async () => {
        await refetch();
        pin
          ? await message.success(`Tickets has been pinned.`)
          : await message.success(`Tickets has been unpinned.`);
      },
    }
  );

  useEffect(() => {
    socket.on(`tickets-updated`, async () => {
      await refetch();
    });

    if (data != null) {
      // loop throught tickets and create socket connection for each ticket when it is updated and when new message is added
      for (const ticket of data.entities) {
        socket.on(`ticket-updated-${ticket.id}`, async (status: string) => {
          // notification.info({
          //   message: `Ticket #${ticket.id} is ${status}`,
          //   placement: "bottomRight",
          //   duration: 6,
          // });
          toast(`Ticket #${ticket.id} is ${status}`, {
            position: "top-right",
          });
          addNotification({
            title: "Ticketings.org",
            message: `Ticket (#${ticket.id}) is ${status}`,
            theme: "darkblue",
            duration: 20000000,
            native: true, // when using native, your OS will handle theming.
          });
          updateTicket();
          await refetch();
        });

        socket.on(`messageCreated-${ticket.id}`, async () => {
          addNotification({
            title: "Ticketings.org",
            message: `You have a New Message (#${ticket.id})`,
            theme: "darkblue",
            duration: 20000000,
            native: true, // when using native, your OS will handle theming.
          });
          messageSound();
          await refetch();
        });
      }
    }
    /* Removing the listeners from the socket. */
    return () => {
      socket.removeListener(`tickets-updated`);
      if (data != null) {
        console.log("unsubscribe");
        for (const ticket of data.entities) {
          socket.removeListener(`ticket-updated-${ticket.id}`);
          socket.removeListener(`messageCreated-${ticket.id}`);
        }
      }
    };
  }, [socket, data]);

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

  /**
   * If the status is In_Progress, return a Tag with the color processing, otherwise if the status is
   * Open, return a Tag with the color red, otherwise if the status is Reopened, return a Tag with the
   * color warning, otherwise if the status is Resolved, return a Tag with the color green, otherwise if
   * the status is Closed, return a Tag with the color purple.
   * @param {TICKET_STATUS} status - TICKET_STATUS
   * @returns a JSX element.
   */
  function renderStatus(status: TICKET_STATUS) {
    switch (status) {
      case TICKET_STATUS.In_Progress:
        return <Tag color="#096dd9">{TICKET_STATUS.In_Progress}</Tag>;
      case TICKET_STATUS.Open:
        return <Tag color="#f5222d">{TICKET_STATUS.Open}</Tag>;
      case TICKET_STATUS.Reopened:
        return <Tag color="#ffa940">{TICKET_STATUS.Reopened}</Tag>;
      case TICKET_STATUS.Resolved:
        return <Tag color="#52c41a">{TICKET_STATUS.Resolved}</Tag>;
      case TICKET_STATUS.Closed:
        return <Tag color="#d9d9d9">{TICKET_STATUS.Closed}</Tag>;
    }
  }

  /**
   * If the status is critical, return a red tag, if the status is major, return a yellow tag, if the
   * status is minor, return a blue tag.
   * @param {TICKET_SEVERITY} status - TICKET_SEVERITY
   * @returns A React Element.
   */
  function renderSeverity(status: TICKET_SEVERITY) {
    switch (status) {
      case TICKET_SEVERITY.CRITICAL:
        return (
          <Tag icon={<FireOutlined />} color="volcano">
            {TICKET_SEVERITY.CRITICAL}
          </Tag>
        );
      case TICKET_SEVERITY.MAJOR:
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="warning">
            {TICKET_SEVERITY.MAJOR}
          </Tag>
        );
      case TICKET_SEVERITY.MINOR:
        return <Tag color="geekblue">{TICKET_SEVERITY.MINOR}</Tag>;
    }
  }

  const confirm = (ids: Key[], status: TICKET_STATUS) => {
    updateMutation.mutate({ ids, status });
  };

  const cancel = () => {
    setSelectedRowKeys([]);
  };

  // for pinned tickets popupConfirm
  const confirmPopUp = (id: number) => {
    pinMutation.mutate({ id });
  };

  const cancelPopUp = () => {};

  // filtered Tickets By pin
  const filterdTicketsPin = data?.entities.filter((ticket) => {
    return ticket.pinned;
  });

  // sum Tickets By messages pinned
  const sumUnreadPinned = filterdTicketsPin?.reduce((pre, cur) => {
    return pre + cur.unread;
  }, 0);

  // filtred Tickest By Status Open
  const filterdTicketsOpened = data?.entities.filter((ticket) => {
    return ticket.status === TICKET_STATUS.Open;
  });

  // sum Tickets By messages opend
  const sumUnreadOpened = filterdTicketsOpened?.reduce((pre, cur) => {
    return pre + cur.unread;
  }, 0);

  // filtred Tickest By Status InProgress
  const filterdTicketsInProgress = data?.entities.filter((ticket) => {
    return ticket.status === TICKET_STATUS.In_Progress;
  });

  // sum Tickets By messages InProgress
  const sumUnreadInProgress = filterdTicketsInProgress?.reduce((pre, cur) => {
    return pre + cur.unread;
  }, 0);

  // filtred Tickest By Status Resolved
  const filterdTicketsSolved = data?.entities.filter((ticket) => {
    return ticket.status === TICKET_STATUS.Resolved;
  });

  // sum Tickets By messages Resolved
  const sumUnreadResolved = filterdTicketsSolved?.reduce((pre, cur) => {
    return pre + cur.unread;
  }, 0);

  // filtred Tickest By Status Closed
  const filterdTicketsClosed = data?.entities.filter((ticket) => {
    return ticket.status === TICKET_STATUS.Closed;
  });

  // sum Tickets By messages Closed
  const sumUnreadClosed = filterdTicketsClosed?.reduce((pre, cur) => {
    return pre + cur.unread;
  }, 0);

  // filtred Tickest By Status Reopened
  const filterdTicketsReopened = data?.entities.filter((ticket) => {
    return ticket.status === TICKET_STATUS.Reopened;
  });

  // sum Tickets By messages Reopened
  const sumUnreadReopened = filterdTicketsReopened?.reduce((pre, cur) => {
    return pre + cur.unread;
  }, 0);

  const handleButtonClick = (ticket: Ticket) => {
    setRecordTicket(ticket);
    setSelectedTicket(ticket.id);
    setOpen(true);
  };

  const columns: Array<ColumnProps<Ticket>> = [
    {
      title: "ID",
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
      sorter: (a, b) => a.id - b.id,
      render: (_, record) => record.id,
    },
    {
      title: "Subject",
      key: "subject",
      dataIndex: "subject",
      ...getColumnSearchTextProps("subject", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      sorter: (a, b) => a.id - b.id,
      render: (_, record) => (
        <Popover content={record.subject} trigger="click">
          <Button
            shape="circle"
            type="primary"
            icon={<FolderFilled size={20} />}
          />
        </Popover>
      ),
    },
    {
      title: "Author",
      key: "user",
      dataIndex: "user",
      ...getColumnSearchOneDepthObjectProps("user", "name", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      render: (_, record) =>
        user?.id === record.user.id ? "You" : record.user.name,
    },
    {
      title: "Entity",
      key: "entity",
      dataIndex: "entity",
      render: (_, record) => record.entity?.name,
    },
    // {
    //   title: "Issuer Team",
    //   key: "issuer_team",
    //   dataIndex: "issuer_team",
    //   render: (_, record) => record.issuer_team?.name,
    // },
    {
      title: "Department",
      key: "departement",
      dataIndex: "departement",
      ...getColumnSearchOneDepthObjectProps("departement", "name", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      render: (_, record) => record.departement?.name,
    },
    {
      title: "Target Team",
      key: "target_team",
      dataIndex: "target_team",
      ...getColumnSearchOneDepthObjectProps("target_team", "name", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      render: (_, record) => record.target_team?.name,
    },
    {
      title: "Taken By",
      key: "assigned_to",
      dataIndex: "assigned_to",
      ...getColumnSearchOneDepthObjectProps("assigned_to", "name", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      render: (_, record) => record.assigned_to?.name,
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      defaultFilteredValue: [
        TICKET_STATUS.Open,
        TICKET_STATUS.In_Progress,
        TICKET_STATUS.Reopened,
        TICKET_STATUS.Resolved,
      ],
      // filters: [
      //   {
      //     text: TICKET_STATUS.Open,
      //     value: TICKET_STATUS.Open,
      //   },
      //   {
      //     text: TICKET_STATUS.In_Progress,
      //     value: TICKET_STATUS.In_Progress,
      //   },
      //   {
      //     text: TICKET_STATUS.Reopened,
      //     value: TICKET_STATUS.Reopened,
      //   },
      //   {
      //     text: TICKET_STATUS.Resolved,
      //     value: TICKET_STATUS.Resolved,
      //   },
      //   {
      //     text: TICKET_STATUS.Closed,
      //     value: TICKET_STATUS.Closed,
      //   },
      // ],
      // onFilter: (value, record) => record.status.indexOf(value as string) === 0,
      render: (_, record) => renderStatus(record.status),
    },
    {
      title: "Severity",
      key: "severity",
      dataIndex: "severity",
      render: (_, record) => renderSeverity(record.severity),
    },
    {
      title: "Date",
      key: "createAt",
      dataIndex: "createAt",
      render: (_, record) =>
        dayjs(record.createdAt).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
    {
      title: "Updates",
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (_, record) =>
        dayjs(record.updatedAt).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            key={4}
            title={
              !record.pinned
                ? "Are you sure you want to pin this ticket?"
                : "Are you sure you want to unpin this ticket?"
            }
            onConfirm={(e) => confirmPopUp(record.id)}
            onCancel={cancelPopUp}
            okText="Yes"
            cancelText="No"
          >
            <Button
              shape="circle"
              title={!record.pinned ? "Pin" : "Unpin"}
              onClick={() => {
                if (!record.pinned) {
                  return setPin(true);
                } else {
                  return setPin(false);
                }
              }}
              icon={!record.pinned ? <PushpinOutlined /> : <PushpinFilled />}
            />
          </Popconfirm>
          {user?.role === ROLE.CHEF ? (
            <>
              {record.status === TICKET_STATUS.Resolved ||
              record.status === TICKET_STATUS.Closed ? null : (
                <Popconfirm
                  key={2}
                  title="Are you sure resolve this ticket?"
                  onConfirm={() => {
                    updateMutation.mutate({
                      ids: [record.id],
                      status: TICKET_STATUS.Resolved,
                    });
                  }}
                  onCancel={cancel}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    shape="circle"
                    icon={<CheckOutlined style={{ color: "green" }} />}
                    color="green"
                  />
                </Popconfirm>
              )}

              <Button
                onClick={() => {
                  setTicketID(record.id);
                  setIsForwardVisible(true);
                }}
                shape="circle"
                icon={<ForwardOutlined />}
              />
            </>
          ) : null}

          <Badge count={record.unread}>
            <Button
              shape="circle"
              icon={<CommentOutlined />}
              onClick={() => handleButtonClick(record)}
              type={selectedTicket === record.id ? "primary" : "default"}
            />
          </Badge>
        </Space>
      ),
    },
  ];

  const hasSelected = selectedRowKeys.length > 0;

  const items: Tab[] = [
    {
      label: (
        <>
          <Badge
            count={filterdTicketsPin?.length}
            style={{ backgroundColor: "#FFB100" }}
          >
            <PushpinFilled />
          </Badge>
          <span style={{ marginLeft: "1.5rem" }}>
            Pinned{" "}
            <Space>
              {sumUnreadPinned !== 0 ? (
                <Badge count={sumUnreadPinned}>
                  {" "}
                  <CommentOutlined />
                </Badge>
              ) : null}
            </Space>
          </span>
        </>
      ),
      key: "1",
      children: (
        <Table
          loading={isLoading}
          rowSelection={{
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys);
            },
            selectedRowKeys,
          }}
          bordered={true}
          rowKey="id"
          columns={columns}
          dataSource={data != null ? filterdTicketsPin : []}
        />
      ),
    },
    {
      label: (
        <>
          <Badge
            count={filterdTicketsOpened?.length}
            style={{ backgroundColor: "#f5222d" }}
          >
            <TagOutlined />
          </Badge>
          <span style={{ marginLeft: "1.5rem" }}>
            Opened{" "}
            <Space>
              {sumUnreadOpened !== 0 ? (
                <Badge count={sumUnreadOpened}>
                  {" "}
                  <CommentOutlined />
                </Badge>
              ) : null}
            </Space>
          </span>
        </>
      ),
      key: "2",
      children: (
        <Table
          loading={isLoading}
          rowSelection={{
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys);
            },
            selectedRowKeys,
          }}
          bordered={true}
          rowKey="id"
          columns={columns}
          dataSource={data != null ? filterdTicketsOpened : []}
        />
      ),
    },
    {
      label: (
        <>
          <Badge
            count={filterdTicketsReopened?.length}
            style={{ backgroundColor: "#ffa940" }}
          >
            <AlertOutlined />
          </Badge>
          <span style={{ marginLeft: "1.5rem" }}>
            Reopened{" "}
            <Space>
              {sumUnreadReopened !== 0 ? (
                <Badge count={sumUnreadReopened}>
                  {" "}
                  <CommentOutlined />
                </Badge>
              ) : null}
            </Space>
          </span>
        </>
      ),
      key: "3",
      children: (
        <Table
          loading={isLoading}
          rowSelection={{
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys);
            },
            selectedRowKeys,
          }}
          bordered={true}
          rowKey="id"
          columns={columns}
          dataSource={data != null ? filterdTicketsReopened : []}
        />
      ),
    },
    {
      label: (
        <>
          <Badge
            count={filterdTicketsInProgress?.length}
            style={{ backgroundColor: "#096dd9" }}
          >
            <ClockCircleOutlined />
          </Badge>
          <span style={{ marginLeft: "1.5rem" }}>
            Inprogress{" "}
            <Space>
              {sumUnreadInProgress !== 0 ? (
                <Badge count={sumUnreadInProgress}>
                  {" "}
                  <CommentOutlined />
                </Badge>
              ) : null}
            </Space>
          </span>
        </>
      ),
      key: "4",
      children: (
        <Table
          loading={isLoading}
          rowSelection={{
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys);
            },
            selectedRowKeys,
          }}
          bordered={true}
          rowKey="id"
          columns={columns}
          dataSource={data != null ? filterdTicketsInProgress : []}
        />
      ),
    },
    {
      label: (
        <>
          <Badge
            count={filterdTicketsSolved?.length}
            style={{ backgroundColor: "#52c41a" }}
          >
            <CheckCircleOutlined />
          </Badge>
          <span style={{ marginLeft: "1.5rem" }}>
            Resolved{" "}
            <Space>
              {sumUnreadResolved !== 0 ? (
                <Badge count={sumUnreadResolved}>
                  {" "}
                  <CommentOutlined />
                </Badge>
              ) : null}
            </Space>
          </span>
        </>
      ),
      key: "5",
      children: (
        <Table
          loading={isLoading}
          rowSelection={{
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys);
            },
            selectedRowKeys,
          }}
          bordered={true}
          rowKey="id"
          columns={columns}
          dataSource={data != null ? filterdTicketsSolved : []}
        />
      ),
    },
    {
      label: (
        <>
          <Badge
            count={filterdTicketsClosed?.length}
            style={{ backgroundColor: "#d9d9d9" }}
          >
            <CloseCircleOutlined />
          </Badge>
          <span style={{ marginLeft: "1.5rem" }}>
            Closed{" "}
            <Space>
              {sumUnreadClosed !== 0 ? (
                <Badge count={sumUnreadClosed}>
                  {" "}
                  <CommentOutlined />
                </Badge>
              ) : null}
            </Space>
          </span>
        </>
      ),
      key: "6",
      children: (
        <Table
          loading={isLoading}
          // rowSelection={{
          //   onChange: (selectedRowKeys) => {
          //     setSelectedRowKeys(selectedRowKeys);
          //   },
          //   selectedRowKeys,
          // }}
          bordered={true}
          rowKey="id"
          columns={columns}
          dataSource={data != null ? filterdTicketsClosed : []}
        />
      ),
    },
    {
      label: (
        <>
          <Badge
            count={Complaints?.length}
            style={{ backgroundColor: "#d9d9d9" }}
          >
            <AuditOutlined />
          </Badge>
          <span style={{ marginLeft: "1rem" }}>Complaints</span>
        </>
      ),
      key: "7",
      children: (
        <Complaint Complaints={Complaints} isLoadingData={isLoadingData} />
      ),
    },
  ];
  return (
    <div>
      <Card
        extra={[
          <div key={1}>
            <Button
              icon={<TagOutlined />}
              onClick={() => setIsPostVisible(true)}
              type="primary"
              style={{ marginRight: 10 }}
            >
              New Ticket
            </Button>
            {user?.role !== ROLE.CHEF && (
              <Button
                key={0}
                icon={<DiffOutlined />}
                type="primary"
                onClick={() => setOpenModel(true)}
              >
                Create Complaint
              </Button>
            )}
          </div>,
          <Popconfirm
            key={2}
            disabled={!hasSelected}
            title="Are you sure close these tickets?"
            onConfirm={(e) => confirm(selectedRowKeys, TICKET_STATUS.Closed)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <Button
              disabled={!hasSelected}
              title="Close"
              danger
              icon={<CloseOutlined />}
            >
              Close Tickets
            </Button>
          </Popconfirm>,
        ]}
        title={<h2>Tickets</h2>}
        // bodyStyle={{ padding: 40 }}
      >
        {openModel && (
          <CreateComplaint
            refetch={refetchData}
            isOpen={openModel}
            setIsOpen={setOpenModel}
          />
        )}
        {isPostVisible && (
          <Create
            refetch={refetch}
            isVisible={isPostVisible}
            setIsVisible={setIsPostVisible}
          />
        )}
        {isForwardVisible && (
          <Forward
            id={ticketId}
            isVisible={isForwardVisible}
            setIsVisible={setIsForwardVisible}
          />
        )}
        <Tabs
          centered
          defaultActiveKey="2"
          type="card"
          animated={true}
          tabPosition="left"
          size={"large"}
          items={items}
        />
      </Card>
      <ChatDrawer
        refetch={refetch}
        ticketId={selectedTicket}
        ticket={recordTicket}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
};

export default Tickets;
