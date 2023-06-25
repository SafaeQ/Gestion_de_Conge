import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Table, Card, message, Popconfirm, Tag } from "antd";
import { ColumnProps } from "antd/lib/table";
import { FilterConfirmProps } from "antd/lib/table/interface";
import { Key, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Link, useHistory } from "react-router-dom";
import { Departement, User } from "../../../types";
import { transport } from "../../../util/Api";
import {
  getColumnSearchOneDepthObjectProps,
  getColumnSearchTextProps,
} from "../../../util/Filter";
import { useSelector } from "react-redux";
import { RootState } from "../../../appRedux/store";

type DataIndex = keyof User;

const Users = () => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery<User[]>(
    "users",
    async () =>
      await transport
        .post(`/users/access_entity`, {
          access_entity_hr: user?.access_entity_hr,
        })
        .then((res) => res.data)
  );

  const history = useHistory();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const deleteMutation = useMutation<any, unknown, { ids: Key[] }>(
    async (ids) =>
      await transport.post("/users/deleteUsers", ids).then((res) => res.data),
    {
      onSuccess: async () => {
        await refetch();
        await message.success("Users(s) Deleted");
      },
      onError: async () => {
        await message.error("Error While Deleting Please try again");
      },
    }
  );

  const { data: departements } = useQuery<Departement[]>(
    "departements",
    async () => await transport.get("/departements").then((res) => res.data)
  );

  const confirm = (ids: Key[]) => {
    deleteMutation.mutate({ ids });
    setSelectedRowKeys([]);
  };

  const cancel = () => {
    setSelectedRowKeys([]);
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

  const columns: Array<ColumnProps<User>> = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
      ...getColumnSearchTextProps("name", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      render: (_, record) => (
        <Link to={`/users/edit/${record.id}`}>{record.name}</Link>
      ),
    },
    {
      title: "Username",
      key: "username",
      dataIndex: "username",
      ...getColumnSearchTextProps("username", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
    },
    {
      title: "Departments",
      key: "departement",
      render: (_, record) =>
        record.departements?.map((departement) => (
          <Tag key={departement.id}>{departement.name}</Tag>
        )),
      filters:
        departements != null
          ? departements.map((departement) => ({
              text: departement.name,
              value: departement.id,
            }))
          : [],
      onFilter: (value, record) =>
        record.departements.findIndex((depart) => depart.id === value) !== -1,
    },
    {
      title: "Entity",
      key: "entity",
      dataIndex: "entity",
      ...getColumnSearchOneDepthObjectProps("entity", "name", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      render: (_, record) => record.entity?.name,
    },
    {
      title: "Team",
      key: "team",
      dataIndex: "team",
      ...getColumnSearchOneDepthObjectProps("team", "name", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
      render: (_, record) => record.team?.name,
    },
    {
      title: "Balance",
      key: "solde",
      dataIndex: "solde",
      render: (_, record) => record.solde,
    },
    {
      title: "Role",
      key: "role",
      dataIndex: "role",
      filters: [
        { text: "ADMINISTRATION", value: "ADMINISTRATION" },
        {
          text: "CHEF",
          value: "CHEF",
        },
        {
          text: "TEAMLEADER",
          value: "TEAMLEADER",
        },
        {
          text: "TEAMMEMBER",
          value: "TEAMMEMBER",
        },
      ],
      onFilter: (value, record) => record.role.indexOf(value as string) === 0,
      render: (_, record) => record.role,
    },
    {
      title: "Type",
      key: "user_type",
      dataIndex: "user_type",
      filters: [
        {
          text: "PROD",
          value: "PROD",
        },
        {
          text: "SUPPORT",
          value: "SUPPORT",
        },
        {
          text: "ADMIN",
          value: "ADMIN",
        },
      ],
      onFilter: (value, record) =>
        record.user_type.indexOf(value as string) === 0,
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (_, record) => (
        <Tag color={record.status === "active" ? "green" : "volcano"}>
          {record.status}
        </Tag>
      ),
    },
  ];
  const hasSelected = selectedRowKeys.length > 0;

  return (
    <div>
      <Card
        extra={[
          <Button
            key={1}
            icon={<PlusCircleOutlined />}
            onClick={() => history.push("/users/create")}
            type="primary"
          >
            Add
          </Button>,
          <Popconfirm
            key={2}
            disabled={!hasSelected}
            title="Are you sure delete this entity?"
            onConfirm={(e) => confirm(selectedRowKeys)}
            onCancel={cancel}
            okText="Yes"
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
        title={<h2>Users</h2>}
        bodyStyle={{ padding: 40 }}
      >
        <Table
          loading={isLoading}
          bordered={true}
          rowSelection={{
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys);
            },
            selectedRowKeys,
          }}
          rowKey="id"
          columns={columns}
          dataSource={users != null ? users : []}
        />
      </Card>
    </div>
  );
};

export default Users;
