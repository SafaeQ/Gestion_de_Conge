import { PlusCircleOutlined } from "@ant-design/icons";
import { Form, message, Modal, Select } from "antd";
import { Dispatch, SetStateAction } from "react";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
  useQuery,
} from "react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../../appRedux/store";
import { Departement, User } from "../../../types";
import { transport } from "../../../util/Api";

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 10,
  },
};

const CreateRestriction: React.FC<{
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  userId: number;
  refetch: (
    options?: (RefetchOptions & RefetchQueryFilters<any>) | undefined
  ) => Promise<QueryObserverResult<User[], unknown>>;
}> = ({ isVisible, setIsVisible, refetch, userId }) => {
  const [form] = Form.useForm();

  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
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
        .post("/users/create-restriction", { restriction: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        void message.success("restriction created");
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
  const Create = () => {
    // valide form and send to server
    form
      .validateFields()
      .then((values) => {
        if (user != null) {
          createMutation.mutate({
            ...values,
            user: userId,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <Modal
      okText="Add"
      onCancel={() => setIsVisible(false)}
      open={isVisible}
      title="New restriction"
      onOk={Create}
      centered={true}
      maskClosable={false}
      okButtonProps={{
        icon: <PlusCircleOutlined />,
        loading: createMutation.isLoading,
      }}
    >
      <Form
        {...formItemLayout}
        labelAlign="left"
        labelCol={{ span: 8 }}
        form={form}
      >
        <Form.Item
          rules={[{ type: "number", required: true, message: "Required!" }]}
          name="departement"
          label="Select departement"
          style={{ marginRight: 18 }}
        >
          <Select<string[], { value: string; children: string }>
            showSearch
            optionFilterProp="children"
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
      </Form>
    </Modal>
  );
};

export default CreateRestriction;
