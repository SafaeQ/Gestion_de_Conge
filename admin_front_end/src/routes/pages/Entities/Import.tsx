import { ImportOutlined, LeftOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, message, Row, Select, Table } from "antd";
import { ColumnProps } from "antd/lib/table";
import { FilterConfirmProps } from "antd/lib/table/interface";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useHistory } from "react-router-dom";
import { ApiUser, Entity, User } from "../../../types";
import { transport } from "../../../util/Api";
import { getColumnSearchTextProps } from "../../../util/Filter";

type DataIndex = keyof ApiUser;

const Import = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [entity, setEntity] = useState(0);
  const [searchedColumn, setSearchColumn] = useState("");
  const [selectedRows, setSelectedRows] = useState<ApiUser[]>([]);
  const { isLoading, data } = useQuery<ApiUser[]>(
    ["homePageSearchQuery", entity],
    async () =>
      await transport
        .get(`/entities/api-fetch/${entity}`)
        .then((res) => res.data),
    {
      enabled: !(entity === 0),
    }
  );

  const {
    data: entities,
    isLoading: isLoadingEnt,
    isFetched: isFetchedEnt,
  } = useQuery<Entity[]>(
    "entities",
    async () => await transport.get("/entities").then((res) => res.data)
  );

  const { mutate, isLoading: isLoadingImport } = useMutation<
    any,
    unknown,
    Array<Partial<User>>
  >(
    async (data) =>
      await transport
        .post("/entities/syncUsers", { users: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        form.resetFields();
        await message.success("Users Synced");
      },
      onError: async (_err) => {
        await message.error("Error Syncing");
      },
    }
  );

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

  const handleImport = () => {
    if (selectedRows.length > 0) {
      const parsedUsers: Array<Partial<User>> = selectedRows.map((user) => {
        const currentEntity = entity as unknown as Entity;
        return {
          name: `${user.fname} ${user.lname}`,
          username: user.email,
          entity: currentEntity,
          password: Math.random().toString(36).slice(-10),
        };
      });
      mutate(parsedUsers);
    } else {
      void message.error("Please select at least one user");
    }
  };

  const columns: Array<ColumnProps<ApiUser>> = [
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      ...getColumnSearchTextProps("email", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
    },
    {
      title: "First Name",
      key: "fname",
      dataIndex: "fname",
      ...getColumnSearchTextProps("fname", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
    },
    {
      title: "Last Name",
      key: "lname",
      dataIndex: "lname",
      ...getColumnSearchTextProps("lname", {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn,
      }),
    },
  ];

  return (
    <div>
      <Card
        extra={[
          <Button
            key={2}
            onClick={() => handleImport()}
            icon={<ImportOutlined />}
            type="primary"
            loading={isLoadingImport}
          >
            import
          </Button>,
          <Button
            key={3}
            onClick={() => history.goBack()}
            icon={<LeftOutlined />}
            type="link"
          >
            goBack
          </Button>,
        ]}
        title="Import Users"
      >
        <Row justify="center" align="middle">
          <Col span={8}>
            <Form form={form}>
              <Form.Item
                rules={[
                  { type: "number", required: true, message: "Required!" },
                ]}
                name="entity"
                label="Select entity"
              >
                <Select<number, { value: number; children: string }>
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option != null ? option.children.includes(input) : false
                  }
                  allowClear
                  onClear={() => setSelectedRows([])}
                  onChange={(value) => setEntity(value)}
                  loading={isLoadingEnt}
                >
                  {isFetchedEnt && entities != null
                    ? entities.map((entity) => (
                        <Select.Option value={entity.id} key={entity.id}>
                          {entity.name}
                        </Select.Option>
                      ))
                    : []}
                </Select>
              </Form.Item>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              loading={isLoading}
              bordered={true}
              rowSelection={{
                onChange: (_, selectedRows) => {
                  setSelectedRows(selectedRows);
                },
              }}
              rowKey={"uid"}
              dataSource={data !== undefined ? data : []}
              columns={columns}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Import;
