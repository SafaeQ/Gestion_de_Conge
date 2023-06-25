import React from "react";
import { DatePicker, Form, Input, Modal, message } from "antd";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
  useQueryClient,
} from "react-query";
import { transport } from "../../../../util/Api";
import { Holiday, User } from "../../../../types";
import { RootState } from "../../../../appRedux/store";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { RangePickerProps } from "antd/es/date-picker";
import { socket } from "../../../../context/socket.provider";

interface NewRequestProps {
  isModalOpen: boolean;
  setIsModalOpen: any;
  dataHoliday: Holiday[];
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Holiday[], unknown>>;
}
const NewRequest = ({
  isModalOpen,
  setIsModalOpen,
  dataHoliday,
  refetch,
}: NewRequestProps) => {
  const [form] = Form.useForm();
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const queryClient = useQueryClient();

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
        socket.emit("requestCreated", data.holiday.id);
        socket.emit("requestCreatedProd", data.holiday.id);
        await queryClient.invalidateQueries("holidays");
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
        // validator function to check the duration is 5 days or more
        const duration = dayjs(values.to).diff(dayjs(values.from), "day");

        let lastRequest = dataHoliday[0];
        for (let i = 1; i < dataHoliday.length; i++) {
          if (dataHoliday[i].user.id === user?.id) {
            const prevDate = dayjs(lastRequest.to);
            const currDate = dayjs(dataHoliday[i].to);
            if (currDate.isAfter(prevDate)) {
              lastRequest = dataHoliday[i]; // Update maxNumber if a higher value is found
            }
          }
        }

        if (dataHoliday?.length !== 0 && user?.id === lastRequest.user.id) {
          //  check if last holiday' duration is 6 month or more
          const diffInMonths = dayjs(values.from).diff(
            dayjs(lastRequest?.to),
            "month"
          );

          if (user != null && diffInMonths >= 5 && duration >= 4) {
            createMutation.mutate({
              ...values,
              user: user?.id,
              createdBy: user.name,
            });
            void refetch();
          } else {
            if (diffInMonths < 5) {
              void message.error(
                "The durration between last holiday leave must be 6 months or more.",
                5
              );
            }
            if (duration < 4) {
              return message.error("The duration must be more than 5 days", 5);
            }
          }
        } else {
          // If no previous holidays, allow the request
          if (duration >= 4) {
            createMutation.mutate({
              ...values,
              user: user?.id,
              createdBy: user?.name,
            });
          } else {
            return message.error("The duration must be more than 5 days", 5);
          }
          void refetch();
        }
      })
      .catch((err) => console.log(err));
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // disable days before today and today
  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    return current && current < dayjs().endOf("day");
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
          rules={[{ required: true, max: 255 }]}
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
