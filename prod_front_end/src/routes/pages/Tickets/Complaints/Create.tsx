import { Form, Input, Modal, message } from "antd";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
  useQueryClient,
} from "react-query";
import { transport } from "../../../../util/Api";
import { Complaints, User } from "../../../../types";
import { RootState } from "../../../../appRedux/store";
import { useSelector } from "react-redux";
import { socket } from "../../../../context/socket.provider";

interface CreateComplaintProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Complaints[], unknown>>;
}
const CreateComplaint = ({
  isOpen,
  setIsOpen,
  refetch,
}: CreateComplaintProps) => {
  const [form] = Form.useForm();
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const queryClient = useQueryClient();

  // create new request of holiday
  const createMutation = useMutation<{ complaint: Complaints }>(
    async (data) =>
      await transport
        .post("/complaints/create", { complaint: data })
        .then((res) => res.data),
    {
      onSuccess: async (data) => {
        void message.success("Complaints is added");
        form.resetFields();
        setIsOpen(false);
        await queryClient.invalidateQueries("Complaints");
        socket.emit("complainCreatedByUser", data.complaint.id);
        await refetch();
      },
      onError: async (_err) => {
        void message.error("Error Creating");
      },
    }
  );

  const NewRequestHandle = () => {
    form
      .validateFields()
      .then((values) => {
        createMutation.mutate({
          ...values,
          user: user?.id,
        });

        void refetch();
      })
      .catch((err) => console.log(err));
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      key={2}
      title="Add a new request"
      centered
      maskClosable={false}
      open={isOpen}
      onOk={NewRequestHandle}
      onCancel={handleCancel}
      okButtonProps={{
        loading: createMutation.isLoading,
      }}
    >
      <Form
        labelAlign="left"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        form={form}
      >
        <Form.Item
          rules={[
            { required: true, message: "Please select the starting date" },
          ]}
          name="subject"
          label="Subject"
        >
          <Input placeholder="add a subject" />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Please select the ending date" }]}
          name="message"
          label="Message"
        >
          <Input placeholder="type a message" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateComplaint;
