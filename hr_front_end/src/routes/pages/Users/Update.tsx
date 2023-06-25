import { useMutation, useQuery } from "react-query";
import { useHistory, useParams } from "react-router-dom";
import { Departement, Team, User, Entity } from "../../../types";
import { useEffect } from "react";
import { Button, Card, Form, Input, Select, Switch, message } from "antd";
import { transport } from "../../../util/Api";
import { LeftOutlined, SaveOutlined, SyncOutlined } from "@ant-design/icons";
import "../HolidayManagement/style/holidayStyle.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../appRedux/store";

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 10,
  },
};

export default function Update() {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const history = useHistory();
  const connectUser = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  const {
    data: departements,
    isLoading: isLoadingDep,
    isFetched: isFetchedDep,
  } = useQuery<Departement[]>(
    "departements",
    async () => await transport.get("/departements").then((res) => res.data),
    {
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const {
    data: entities,
    isLoading: isLoadingEnt,
    isFetched: isFetchedEnt,
  } = useQuery<Entity[]>(
    "entities",
    async () => await transport.get("/entities").then((res) => res.data),
    {
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const {
    data: teams,
    isLoading: isLoadingTeams,
    isFetched: isFetchedTeam,
  } = useQuery<Team[]>(
    "teams",
    async () => await transport.get("/teams").then((res) => res.data),
    {
      onError: (error) => {
        console.log(error);
      },
    }
  );
  const {
    data: user,
    isLoading: isLoadingUser,
    isFetched: isFetchedUser,
  } = useQuery<User>(
    "user-admin",
    async () => await transport.get(`/users/${id}`).then((res) => res.data),
    {
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const updateMutation = useMutation<unknown, unknown, User>(
    async (user) =>
      await transport.put(`/users/${id}`, { user }).then((res) => res.data),
    {
      onSuccess: () => {
        history.goBack();
        void message.success("User updated");
        form.resetFields();
      },
      onError: () => {
        void message.error("Error Creating");
      },
    }
  );

  useEffect(() => {
    if (isFetchedUser && user != null) {
      form.setFieldsValue({
        ...user,
        entity: user.entity?.id,
        departements: user.departements?.map((depart) => depart.id),
        team: user.team?.id,
        status: user.status === "active",
      });
    }
  }, [user]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        for (const key in values) {
          if (values[key] === undefined) {
            values[key] = null;
          }
        }
        updateMutation.mutate({
          ...values,
          status: (values.status as boolean) ? "active" : "inactive",
        });
      })
      .catch((err) => console.log(err));
  };

  return (
    <Card
      extra={[
        <Button
          key={1}
          loading={updateMutation.isLoading}
          onClick={() => handleSave()}
          icon={<SaveOutlined />}
          type="primary"
        >
          Save
        </Button>,
        <Button
          key={2}
          onClick={() => history.goBack()}
          icon={<LeftOutlined />}
          type="link"
          className="back-btn"
        >
          goBack
        </Button>,
      ]}
      title="Update User"
    >
      <Form {...formItemLayout} labelAlign="left" form={form}>
        {isLoadingUser ? (
          <SyncOutlined spin />
        ) : (
          <>
            <Form.Item
              rules={[{ required: true, message: "Required!" }]}
              name="name"
              label="Name"
            >
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Required!" }]}
              name="username"
              label="Username"
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Required!" }]}
              name="solde"
              label="Balance"
            >
              <Input placeholder="enter a number" />
            </Form.Item>
            <Form.Item
              rules={[{ type: "array", required: true, message: "Required!" }]}
              name="departements"
              label="Select departement"
            >
              <Select<number[], { value: number; children: string }>
                mode="multiple"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option != null
                    ? option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    : false
                }
                allowClear
                loading={isLoadingDep}
              >
                {isFetchedDep && departements != null
                  ? departements.map((departement) => (
                      <Select.Option
                        value={departement.id}
                        key={departement.id}
                      >
                        {departement.name}
                      </Select.Option>
                    ))
                  : []}
              </Select>
            </Form.Item>

            <Form.Item
              rules={[{ type: "number" }]}
              name="entity"
              label="Select entity"
            >
              <Select<string[], { value: string; children: string }>
                showSearch
                allowClear
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option != null ? option.children.includes(input) : false
                }
                loading={isLoadingEnt}
              >
                {isFetchedEnt && entities != null
                  ? entities.map((entity) => {
                      const entitID = connectUser?.access_entity_hr.includes(
                        entity.id
                      );
                      return entitID ? (
                        <Select.Option value={entity.id} key={entity.id}>
                          {entity.name}
                        </Select.Option>
                      ) : null;
                    })
                  : []}
              </Select>
            </Form.Item>
            <Form.Item name="team" label="Select team">
              <Select<string[], { value: string; children: string }>
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option != null ? option.children.includes(input) : false
                }
                allowClear
                loading={isLoadingTeams}
              >
                {isFetchedTeam && teams != null
                  ? teams.map((team) => (
                      <Select.Option value={team.id} key={team.id}>
                        {team.name}
                      </Select.Option>
                    ))
                  : []}
              </Select>
            </Form.Item>
            <Form.Item
              rules={[{ type: "string", required: true, message: "Required!" }]}
              name="role"
              label="Select role"
            >
              <Select<string[], { value: string; children: string }>
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option != null ? option.children.includes(input) : false
                }
                allowClear
                loading={isLoadingTeams}
              >
                {["ADMINISTRATION", "CHEF", "TEAMLEADER", "TEAMMEMBER"].map(
                  (role) => (
                    <Select.Option value={role} key={role}>
                      {role}
                    </Select.Option>
                  )
                )}
              </Select>
            </Form.Item>
            <Form.Item name="status" label="status" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="visible" label="visible" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Please choose user type!" }]}
              name="user_type"
              label="User Type"
            >
              <Select>
                {["PROD", "SUPPORT", "ADMIN"].map((departType) => (
                  <Select.Option key={departType}>{departType}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="password" label="Password">
              <Input.Password placeholder="Password" />
            </Form.Item>
          </>
        )}
      </Form>
    </Card>
  );
}
