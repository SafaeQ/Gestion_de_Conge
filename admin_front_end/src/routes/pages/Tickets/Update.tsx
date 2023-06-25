import { LeftOutlined, SaveOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Select, Form, Tag } from "antd";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useHistory, useParams } from "react-router-dom";
import {
  Departement,
  Entity,
  Team,
  Ticket,
  TICKET_STATUS,
} from "../../../types";
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
  const [form] = Form.useForm();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filteredTeam, setTeams] = useState<Team[]>([]);

  const { data: departements } = useQuery<Departement[]>(
    "departements",
    async () => await transport.get("/departements").then((res) => res.data)
  );

  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>(
    "teams",
    async () => await transport.get("/teams").then((res) => res.data)
  );

  const { data: entities } = useQuery<Entity[]>(
    "entities",
    async () => await transport.get("/entities").then((res) => res.data)
  );

  const { data: users } = useQuery<Team[]>(
    "users",
    async () => await transport.get("/users").then((res) => res.data)
  );

  const {
    data: ticket,
    isLoading,
    isFetched,
  } = useQuery<Ticket>(
    "ticket",
    async () => await transport.get(`/tickets/${id}`).then((res) => res.data)
  );

  const updateMutation = useMutation(
    async (data) =>
      await transport
        .put(`/tickets/${id}`, { ticket: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        history.goBack();
        await message.success("Ticket updated");
        form.resetFields();
      },
      onError: async () => {
        await message.error("Error Updating");
      },
    }
  );

  useEffect(() => {
    if (isFetched && ticket != null) {
      form.setFieldsValue({
        ...ticket,
        user: ticket.user?.id,
        entity: ticket.entity?.id,
        departement: ticket.departement?.id,
        assigned_to: ticket.assigned_to?.id,
        issuer_team: ticket.issuer_team?.id,
        target_team: ticket.target_team?.id,
      });
    }
  }, [ticket]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        updateMutation.mutate({
          ...values,
        });
      })
      .catch((err) => console.log(err));
  };

  const GetColor = (severity: string) => {
    switch (severity) {
      case "MINOR":
        return "default";
      case "MAJOR":
        return "orange";
      case "CRITICAL":
        return "red";
    }
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
      title={`Update Ticket #${id}`}
    >
      <Form {...formItemLayout} labelAlign="left" form={form}>
        {isLoading ? (
          <SyncOutlined spin />
        ) : (
          <>
            <Form.Item
              rules={[{ required: true, message: "Required!" }]}
              name="subject"
              label="Subject"
            >
              <Input placeholder="Subject" />
            </Form.Item>

            <Form.Item
              rules={[{ required: true, message: "Required!" }]}
              name="related_ressource"
              label="Related Ressource"
            >
              <Input placeholder="Related Ressource" />
            </Form.Item>

            <Form.Item
              rules={[{ type: "number", required: true, message: "Required!" }]}
              name="departement"
              label="Select departement"
            >
              <Select<number, { value: number; children: string }>
                showSearch
                optionFilterProp="children"
                onChange={(value) => {
                  if (teams != null && Array.isArray(teams)) {
                    setTeams(
                      teams.filter(
                        (team) => team.departement?.id === Number(value)
                      )
                    );
                  }
                }}
                filterOption={(input, option) =>
                  option != null ? option.children.includes(input) : false
                }
                allowClear
              >
                {departements != null
                  ? departements.map((depart) => (
                      <Select.Option value={depart.id} key={depart.id}>
                        {depart.name}
                      </Select.Option>
                    ))
                  : []}
              </Select>
            </Form.Item>

            <Form.Item
              rules={[{ type: "number", required: true, message: "Required!" }]}
              name="user"
              label="Select User"
            >
              <Select<string[], { value: string; children: string }>
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option != null ? option.children.includes(input) : false
                }
                allowClear
              >
                {users != null
                  ? users.map((user) => (
                      <Select.Option value={user.id} key={user.id}>
                        {user.name}
                      </Select.Option>
                    ))
                  : []}
              </Select>
            </Form.Item>

            <Form.Item name="assigned_to" label="Taken By">
              <Select<string[], { value: string; children: string }>
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option != null ? option.children.includes(input) : false
                }
                allowClear
              >
                {users != null
                  ? users.map((user) => (
                      <Select.Option value={user.id} key={user.id}>
                        {user.name}
                      </Select.Option>
                    ))
                  : []}
              </Select>
            </Form.Item>

            <Form.Item
              rules={[{ type: "number", required: true, message: "Required!" }]}
              name="entity"
              label="Select entity"
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
                {entities?.map((entity) => (
                  <Select.Option value={entity.id} key={entity.id}>
                    {entity.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              rules={[{ type: "number", required: true, message: "Required!" }]}
              name="issuer_team"
              label="Select issuer team"
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
                {teams?.map((team: Team) => (
                  <Select.Option value={team.id} key={team.id}>
                    {team.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              rules={[{ type: "number", required: true, message: "Required!" }]}
              name="target_team"
              label="Select target team"
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
                {teams?.map((team: Team) => (
                  <Select.Option value={team.id} key={team.id}>
                    {team.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="severity" label="Severity">
              <Select>
                {["CRITICAL", "MAJOR", "MINOR"].map((severity) => (
                  <Select.Option key={severity}>
                    <Tag color={GetColor(severity)}>{severity}</Tag>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="status" label="Status">
              <Select>
                {Object.values(TICKET_STATUS).map((severity) => (
                  <Select.Option key={severity}>
                    <Tag color={GetColor(severity)}>{severity}</Tag>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    </Card>
  );
}
