import { TagOutlined } from "@ant-design/icons";
import { Form, Input, message, Modal, Select, Tag } from "antd";
import { Dispatch, SetStateAction, useState } from "react";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
  useQuery,
} from "react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../../appRedux/store";
import { Departement, Team, Ticket, User } from "../../../types";
import { transport } from "../../../util/Api";

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 10,
  },
};

const Create: React.FC<{
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  refetch: (
    options?: (RefetchOptions & RefetchQueryFilters<any>) | undefined
  ) => Promise<QueryObserverResult<{ entities: Ticket[] }, unknown>>;
}> = ({ isVisible, setIsVisible, refetch }) => {
  const [form] = Form.useForm();
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const [filteredTeam, setTeams] = useState<Team[]>([]);
  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>(
    "teams",
    async () => await transport.get("/teams").then((res) => res.data)
  );

  const { data: departements, isFetched: isFetchedDepart } = useQuery<
    Departement[]
  >(
    "departements",
    async () => await transport.get("/departements").then((res) => res.data)
  );

  const createMutation = useMutation(
    async (data) =>
      await transport
        .post("/tickets/create", { ticket: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        void message.success("Ticket created");
        setIsVisible(false);
        await refetch();
        form.resetFields();
      },
      onError: async (_err) => {
        void message.error("Error Creating");
      },
    }
  );

  /**
   * If the user is valid, then create a mutation with the values, user, entity, and issuer_team.
   */
  const PostTicketHandler = () => {
    // valide form and send to server
    form
      .validateFields()
      .then((values) => {
        if (user != null) {
          createMutation.mutate({
            ...values,
            user: user.id,
            entity: user.entity?.id,
            issuer_team: user.team?.id,
          });
        }
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
    <Modal
      okText="Post"
      onCancel={() => setIsVisible(false)}
      open={isVisible}
      title="Post New Ticket"
      style={{ minWidth: "50%" }}
      onOk={PostTicketHandler}
      centered={true}
      maskClosable={false}
      okButtonProps={{
        icon: <TagOutlined />,
        loading: createMutation.isLoading,
      }}
    >
      <Form {...formItemLayout} labelAlign="left" form={form}>
        <Form.Item
          rules={[{ required: true, max: 40 }]}
          name="subject"
          label="Subject"
        >
          <Input placeholder="Subject" />
        </Form.Item>

        <Form.Item
          rules={[{ required: true, max: 40 }]}
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
                  teams.filter((team) => team.departement?.id === Number(value))
                );
              }
            }}
            filterOption={(input, option) =>
              option != null ? option.children.includes(input) : false
            }
            allowClear
          >
            {isFetchedDepart && departements != null
              ? departements
                  .filter((depart) => depart.depart_type === "SUPPORT")
                  .map((depart) => (
                    <Select.Option value={depart.id} key={depart.id}>
                      {depart.name}
                    </Select.Option>
                  ))
              : []}
          </Select>
        </Form.Item>

        <Form.Item
          rules={[{ type: "number", required: true, message: "Required!" }]}
          name="target_team"
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
            {filteredTeam.map((team) => (
              <Select.Option value={team.id} key={team.id}>
                {team.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Required!" }]}
          name="body"
          label="Message"
        >
          <Input.TextArea rows={10} placeholder="Message" />
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
      </Form>
    </Modal>
  );
};

export default Create;
