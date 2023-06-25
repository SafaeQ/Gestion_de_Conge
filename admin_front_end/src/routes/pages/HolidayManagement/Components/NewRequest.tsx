import React, { useState } from "react";
import { DatePicker, Form, Input, Modal, Select, message } from "antd";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { transport } from "../../../../util/Api";
import { Holiday, REQUEST_HOLIDAY_STATUS, User } from "../../../../types";
import dayjs from "dayjs";
import { RangePickerProps } from "antd/es/date-picker";
import { socket } from "../../../../context/socket.provider";
interface NewRequestProps {
  isModalOpen: boolean;
  setIsModalOpen: any;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Holiday[], unknown>>;
}
const NewRequest = ({
  isModalOpen,
  setIsModalOpen,
  refetch,
}: NewRequestProps) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);

  // get users
  const { data: users } = useQuery<User[]>("users", async () => {
    return await transport.get("users").then((res) => res.data);
  });

  // create new request of holiday
  const createMutation = useMutation<{ holiday: Holiday }>(
    async (data) =>
      await transport
        .post("/holidays/create", { holiday: data })
        .then((res) => res.data),
    {
      onSuccess: async (data) => {
        void message.success("New Request is added");
        form.resetFields();
        setIsModalOpen(false);
        if (data.holiday.status === REQUEST_HOLIDAY_STATUS.Approve) {
          mutate({
            id: data.holiday.user as unknown as number,
            holidayId: data.holiday.id,
          });
        }
        socket.emit("requestCreated", data.holiday.id);
        await queryClient.invalidateQueries("holidays");
        await refetch();
      },
      onError: async (_err) => {
        void message.error("Error Creating");
      },
    }
  );

  //  update solde
  const { mutate } = useMutation(
    async ({ id, holidayId }: { id: number; holidayId: number }) => {
      return await transport.put(`/holidays/solde/update/${id}`, { holidayId });
    },
    {
      onSuccess: async () => {
        void message.success("solde");
      },
      onError: async () => {
        void message.error("Error Updating solde");
      },
    }
  );

  const NewRequestHandle = () => {
    form
      .validateFields()
      .then((values) => {
        const soldeUser = users?.find((res) => res.id === selectedUserId);

        if (soldeUser != null && soldeUser?.solde > 0) {
          createMutation.mutate({
            ...values,
            user: selectedUserId,
            createdBy: "superAdmin",
            status: REQUEST_HOLIDAY_STATUS.Approve,
          });
        } else {
          void message.error(
            "The user don't have balance to add a new request"
          );
          form.resetFields();
          setIsModalOpen(false);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // disable days before today and today
  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return current && current < dayjs().endOf("day");
  };

  const handleUserSearch = (value: string) => {
    setSearchQuery(value);
    setSearchResults(
      users?.filter((user) =>
        user.name.toLowerCase().includes(value.toLowerCase())
      ) ?? []
    );
  };

  const onSearch = (value: string) => {
    handleUserSearch(value);
  };

  return (
    <Modal
      key={2}
      title="Add a new request"
      centered
      maskClosable={false}
      open={isModalOpen}
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
          rules={[{ required: true, max: 40 }]}
          name="user"
          label="Name"
        >
          <Select
            showSearch
            placeholder="Select user"
            optionFilterProp="children"
            onChange={handleUserSearch}
            value={searchQuery}
            onSelect={(value, option) => {
              form.setFieldsValue({ user: option.value });
              setSelectedUserId(option.key);
            }}
            onSearch={onSearch}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={searchResults.map((user) => ({
              value: user.name,
              label: user.name,
              key: user.id,
            }))}
            allowClear
          />
        </Form.Item>

        <Form.Item
          rules={[
            { required: true, message: "Please select the starting date" },
          ]}
          name="from"
          label="From"
        >
          <DatePicker disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Please select the ending date" }]}
          name="to"
          label="To"
        >
          <DatePicker disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, max: 40 }]}
          name="notes"
          label="Notes"
        >
          <Input placeholder="Why you need holiday" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewRequest;
