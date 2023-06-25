import { LeftOutlined, SaveOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Select, Switch, Form } from "antd";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useHistory, useParams } from "react-router-dom";
import { Departement, Entity, Team, User } from "../../../types";
import { transport } from "../../../util/Api";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedRole, setSelectedRole] = useState<string>("");

  const {
    data: departements,
    isLoading: isLoadingDep,
    isFetched: isFetchedDep,
  } = useQuery<Departement[]>(
    "departements",
    async () => await transport.get("/departements").then((res) => res.data)
  );
  const {
    data: entities,
    isLoading: isLoadingEnt,
    isFetched: isFetchedEnt,
  } = useQuery<Entity[]>(
    "entities",
    async () => await transport.get("/entities").then((res) => res.data)
  );
  const {
    data: teams,
    isLoading: isLoadingTeams,
    isFetched: isFetchedTeam,
  } = useQuery<Team[]>(
    "teams",
    async () => await transport.get("/teams").then((res) => res.data)
  );

  const {
    data: user,
    isLoading: isLoadingUser,
    isFetched: isFetchedUser,
  } = useQuery<User>(
    "user",
    async () => await transport.get(`/users/${id}`).then((res) => res.data)
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

  console.log(user);

  useEffect(() => {
    if (isFetchedUser && user != null) {
      form.setFieldsValue({
        ...user,
        entity: user.entity?.id,
        departements: user.departements.map((depart) => depart.id),
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
                  ? entities.map((entity) => (
                      <Select.Option value={entity.id} key={entity.id}>
                        {entity.name}
                      </Select.Option>
                    ))
                  : []}
              </Select>
            </Form.Item>
            <Form.Item
              // rules={[{ type: "number", required: true, message: "Required!" }]}
              name="team"
              label="Select team"
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
                onSelect={(value) => setSelectedRole(value)}
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
            <Form.Item
              rules={[{ type: "array", required: true, message: "Required!" }]}
              name="access_entity"
              label="Select access entities"
            >
              <Select<string[], { value: string; children: string }>
                mode="multiple"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option != null ? option.children.includes(input) : false
                }
                allowClear
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
            {user?.role === "ADMINISTRATION" && (
              <Form.Item
                rules={[
                  { type: "array", required: true, message: "Required!" },
                ]}
                name="access_entity_hr"
                label="Select access entities Hr"
              >
                <Select<string[], { value: string; children: string }>
                  mode="multiple"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option != null ? option.children.includes(input) : false
                  }
                  allowClear
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
            )}
            <Form.Item
              rules={[{ type: "array", required: true, message: "Required!" }]}
              name="access_team"
              label="Select access team"
            >
              <Select<string[], { value: string; children: string }>
                mode="multiple"
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
            {user?.role === "TEAMLEADER" || selectedRole === "TEAMLEADER" ? (
              <Form.Item
                rules={[{ type: "array", message: "Required!" }]}
                name="access_planning_teams"
                label="Select access planning teams"
              >
                <Select<string[], { value: string; children: string }>
                  mode="multiple"
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
            ) : null}
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
