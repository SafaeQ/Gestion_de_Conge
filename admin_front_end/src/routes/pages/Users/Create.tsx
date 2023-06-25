import { LeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Select, Switch, Form } from "antd";
import { useMutation, useQuery } from "react-query";
import { useHistory } from "react-router-dom";
import { Departement, Entity, Team,  } from "../../../types";
import { transport } from "../../../util/Api";
import { useState } from "react";

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 10,
  },
};

export default function Create() {
  const [form] = Form.useForm();
  const history = useHistory();
  const [selectedRole, setSelectedRole] = useState<string>("");

  /* A react hook that is used to fetch data from the server. */
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

  const createMutation = useMutation(
    async (data) =>
      await transport
        .post("/users/create", { user: data })
        .then((res) => res.data),
    {
      onSuccess: () => {
        history.goBack();
        void message.success("User created");
        form.resetFields();
      },
      onError: (err: any) => {
        void message.error(err.response?.data.error);
      },
    }
  );

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        createMutation.mutate({
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
          loading={createMutation.isLoading && !createMutation.isError}
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
      title="Create User"
    >
      <Form
        initialValues={{
          status: true,
        }}
        {...formItemLayout}
        labelAlign="left"
        form={form}
      >
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
                ? option.children.toLowerCase().includes(input.toLowerCase())
                : false
            }
            allowClear
            loading={isLoadingDep}
          >
            {isFetchedDep && departements != null
              ? departements.map((departement) => (
                  <Select.Option value={departement.id} key={departement.id}>
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
          rules={[{ type: "number", required: true, message: "Required!" }]}
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
        {selectedRole === "ADMINISTRATION" && (
          <Form.Item
            rules={[{ type: "array", required: true, message: "Required!" }]}
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
          label="Select access teams"
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

        {selectedRole === "TEAMLEADER" && (
          <Form.Item
            rules={[{ type: "array", required: true, message: "Required!" }]}
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
        )}
        <Form.Item name="status" label="status" valuePropName="checked">
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
        <Form.Item
          rules={[{ required: true, message: "Required!" }]}
          name="password"
          label="Password"
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
      </Form>
    </Card>
  );
}
