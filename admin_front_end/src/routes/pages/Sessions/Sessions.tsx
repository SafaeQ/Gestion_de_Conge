import {
  DeleteOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  message,
  Popconfirm,
  Popover,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import { FilterConfirmProps } from "antd/lib/table/interface";
import dayjs from "dayjs";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Session } from "../../../types";
import { transport } from "../../../util/Api";
import {
  getColumnSearchOneDepthObjectProps,
  getColumnSearchTextProps,
} from "../../../util/Filter";

type DataIndex = keyof Session;

const Sessions = () => {
  const [session, setSession] = useState();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { refetch, isLoading } = useQuery(
    "sessions",
    async () => {
      return await transport.get("/sessions").then((res) => res.data);
    },

    {
      onSuccess: (data) => {
        setSession(data);
      },
      onError: (err) => {
        console.log(err);
        void message.error("Somthing went wrong");
      },
    }
  );
  const updateSessionMutation = useMutation<
    any,
    unknown,
    { id: number[]; active: boolean }
  >(
    async (session) =>
      await transport.post(`/sessions/edit`, session).then((res) => res.data),
    {
      onSuccess: async () => {
        void message.success("session updated");
        await refetch();
      },
      onError: async () => {
        await message.error("Error Updating");
      },
    }
  );

  const updateStatus = (checked: boolean, record: Session) => {
    updateSessionMutation.mutate({
      id: [record.id],
      active: !!checked,
    });
  };

  const deleteMutation = useMutation<any, unknown, { ids: any }>(
    async (ids) =>
      await transport.post("/sessions/delete", ids).then((res) => res.data),
    {
      onSuccess: async () => {
        await refetch();
        await message.success("Session Deleted");
      },
      onError: async () => {
        await message.error("Error While Deleting Please try again");
      },
    }
  );

  const confirm = (ids: any) => {
    deleteMutation.mutate({ ids });
    setSelectedRowKeys([]);
  };

  const cancel = () => {
    setSelectedRowKeys([]);
  };
  // search
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
    if (clearFilters !== undefined) clearFilters();
    setSearchText("");
  };
  const columns: Array<ColumnProps<Session>> = [
    {
      title: "Id",
      key: "id",
      dataIndex: "id",
    },
    {
      title: "User",
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
      render(value, record) {
        return record.user.name;
      },
    },
    {
      title: "Active",
      key: "active",
      dataIndex: "active",
      render: (_, record) => (
        <Space align="baseline">
          <Switch
            style={{ backgroundColor: "#52c41a", color: "black" }}
            checkedChildren={record.active}
            unCheckedChildren={record.active}
            checked={record.active}
            onChange={(checked) => updateStatus(checked, record)}
          />
        </Space>
      ),
    },
    {
      title: "IpAddress",
      key: "ip",
      dataIndex: "ip",
      ...getColumnSearchTextProps("ip", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
    },
    {
      title: "Ip History",
      key: "iphistory",
      dataIndex: "iphistory",
      render(value, record, index) {
        return (
          <Popover
            // destroyTooltipOnHide={true}
            // trigger="click"
            // placement="left"
            // arrowContent={null}
            // autoAdjustOverflow
            content={record.iphistory.map((ip) => (
              <Tag color="green" key={ip}>
                {ip}
              </Tag>
            ))}
          >
            <Button color="blue" style={{ borderRadius: 50 }}>
              <GlobalOutlined color="blue" size={30}/>
            </Button>
          </Popover>
        );
      },
    },
    {
      title: "Type",
      key: "type",
      dataIndex: "type",
    },
    {
      title: "Date",
      key: "createAt",
      dataIndex: "createAt",
      render: (_, session) =>
        dayjs(session.createdAt).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
    {
      title: "Updates",
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (_, session) =>
        dayjs(session.updatedAt).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
  ];
  const hasSelected = selectedRowKeys?.length > 0;

  return (
    <div>
      <Card
        extra={[
          <Popconfirm
            key={2}
            title="Are you sure delete this Session?"
            onCancel={cancel}
            onConfirm={(e) => confirm(selectedRowKeys)}
            okText="Yes"
            disabled={!hasSelected}
            cancelText="No"
          >
            <Button
              loading={deleteMutation.isLoading}
              danger
              disabled={!hasSelected}
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>,
        ]}
        title={<h2>Sessions</h2>}
        bodyStyle={{ padding: 40 }}
      >
        <Table
          bordered={true}
          rowKey="id"
          loading={isLoading}
          columns={columns}
          rowSelection={{
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys);
            },
            selectedRowKeys,
          }}
          dataSource={session}
        />
      </Card>
    </div>
  );
};

export default Sessions;
