import { CloseCircleTwoTone, PlusCircleFilled } from "@ant-design/icons";
import {
  FloatButton,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Tabs,
} from "antd";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { transport } from "../../../../util/Api";
import { TimeType } from "../context/planningContext";
import DragShifts from "./DragShifts";
import { Tab } from "rc-tabs/lib/interface";

interface FormProps {
  times: TimeType[];
}

export const FormShift = ({ times }: FormProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [form] = Form.useForm<TimeType>();

  const handleCancel = () => {
    setIsOpen(false);
  };

  const CancelModal = () => {
    setIsOpenModal(false);
  };

  // add shift
  const createShiftsMutation = useMutation<
    any,
    unknown,
    { value: string; bgColor: string }
  >(
    async (data) =>
      await transport.post("/shifts", data).then((res) => res.data),
    {
      onSuccess: async () => {
        setIsOpen(false);
        form.resetFields();
        await queryClient.refetchQueries("shift");
        await message.success("The Shift is successfully added");
      },
      onError: async () => {
        await message.error("Somthing went wrong");
      },
    }
  );

  const hundleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const dataTime = {
          value:
            values.startTime.replace(/:/, "h") +
            "-" +
            values.endTime.replace(/:/, "h"),
          bgColor: values.bgColor,
        };
        // if (times?.find((el) => el.value === dataTime.value) != null) {
        //   void message.error("shift already exists");
        //   return;
        // }
        createShiftsMutation.mutate(dataTime);
      })
      .catch((err) => console.log(err));
  };

  // add holiday
  const createShiftsHolidayMutation = useMutation<
    any,
    unknown,
    { value: string; bgColor: string; holiday: boolean }
  >(
    async (data) =>
      await transport.post("/shifts", data).then((res) => res.data),
    {
      onSuccess: async () => {
        setIsOpenModal(false);
        form.resetFields();
        await queryClient.refetchQueries("shift");
        await message.success("The Shift is successfully added");
      },
      onError: async () => {
        await message.error("Somthing went wrong");
      },
    }
  );

  const hundleSubmitHoliday = () => {
    form
      .validateFields()
      .then((values) => {
        const dataTime = {
          value: values.holiday,
          bgColor: values.bgColor,
          holiday: true,
        };
        if (times?.find((el) => el.value === dataTime.value) != null) {
          void message.error("shift already exists");
          return;
        }
        createShiftsHolidayMutation.mutate(dataTime);
      })
      .catch((err) => console.log(err));
  };

  // deleteShifts after create
  const deleteShiftsMutation = useMutation<any, unknown, TimeType>(
    async (time) =>
      await transport
        .post(`/shifts/${time.id}`, { deleted: true })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        await queryClient.refetchQueries("shift");
        await message.success("The Shift is deleted successfully");
      },
      onError: async () => {
        await message.error("Somthing went wrong");
      },
    }
  );

  const deleteShifts = (time: TimeType) => {
    deleteShiftsMutation.mutate(time);
  };

  const cancel = () => {
    void message.error("Canceled");
  };

  const renderAddShiftModal = () => {
    return (
      <Modal
        title="Add Time"
        open={isOpen}
        onCancel={handleCancel}
        onOk={hundleSubmit}
      >
        <Form form={form}>
          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[
              {
                required: true,
                message: "Please input your Start Time!",
              },
            ]}
            style={{ padding: 20 }}
          >
            <Input size="large" type="time" />
          </Form.Item>
          <Form.Item
            label="End Time"
            name="endTime"
            rules={[
              {
                required: true,
                message: "Please input your End Time!",
              },
            ]}
            style={{ padding: 20 }}
          >
            <Input size="large" type="time" />
          </Form.Item>
          <Form.Item
            label=" Pick a color"
            name="bgColor"
            rules={[
              {
                required: true,
                message: "Please input your Color!",
              },
            ]}
            style={{ padding: 20 }}
          >
            <Input type="color" id="xyz" />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const renderAddHolidayModal = () => {
    return (
      <Modal
        title="Add Holiday"
        open={isOpenModal}
        onCancel={CancelModal}
        onOk={hundleSubmitHoliday}
      >
        <Form form={form}>
          <Form.Item
            label="Holiday"
            name="holiday"
            rules={[
              {
                required: true,
                message: "Please input a Holiday!",
              },
            ]}
            style={{ padding: 20 }}
          >
            <Input size="large" type="text" />
          </Form.Item>
          <Form.Item
            label=" Pick a color"
            name="bgColor"
            rules={[
              {
                required: true,
                message: "Please input your Color!",
              },
            ]}
            style={{ padding: 20 }}
          >
            <Input type="color" id="xyz" />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const items: Tab[] = [
    {
      key: "1",
      label: "Shifts",
      children: (
        <>
          <FloatButton
            type="primary"
            icon={<PlusCircleFilled style={{ color: "#fff" }} />}
            key={1}
            onClick={() => setIsOpen(true)}
            style={{
              margin: 0,
              position: "fixed",
              bottom: 60,
              right: 30,
              marginLeft: 20,
            }}
          />

          <div id="external-events">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                maxHeight: 400,
                width: "100%",
              }}
            >
              {times
                ?.filter(
                  (time: any) =>
                    time.holiday === false &&
                    time.user === null &&
                    time.deleted === false
                )
                .map((time: any) => {
                  return (
                    <div
                      key={Math.random()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <>
                        <DragShifts
                          id={time.id}
                          bgColor={time.bgColor}
                          startTime={time.value}
                          endTime={time.endTime}
                          key={time.id}
                        />
                        {time.todelete === true ? (
                          <Popconfirm
                            title="Are you sure to delete this Shift ?"
                            onConfirm={() => deleteShifts(time)}
                            onCancel={cancel}
                            okText="Yes"
                            cancelText="No"
                          >
                            <CloseCircleTwoTone twoToneColor="#f5222d" />
                          </Popconfirm>
                        ) : null}
                      </>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      ),
    },
    {
      key: "2",
      label: "Holidays",
      disabled:
        times?.filter((time: any) => time.holiday === true).length === 0,
      children: (
        <div id="external-events">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "0.5rem",
              maxHeight: 400,
              width: "100%",
            }}
          >
            {times
              ?.filter((time: any) => time.holiday === true)
              .map((time: any) => {
                return (
                  <div
                    key={Math.random()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <DragShifts
                      id={time.id}
                      bgColor={time.bgColor}
                      startTime={time.value}
                      holiday={time.holiday}
                      key={time.id}
                    />
                    <Popconfirm
                      title="Are you sure to delete this Shift?"
                      onConfirm={() => deleteShifts(time)}
                      onCancel={cancel}
                      okText="Yes"
                      cancelText="No"
                    >
                      <CloseCircleTwoTone twoToneColor="#f5222d" />
                    </Popconfirm>
                  </div>
                );
              })}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {renderAddShiftModal()}
      {renderAddHolidayModal()}
      <Tabs
        animated={true}
        defaultActiveKey="1"
        type="card"
        tabPosition={"top"}
        centered
        items={items}
        style={{
          padding: 10,
          boxShadow: "#64646f33 0px  1px 4px",
          // height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          position: "relative",
          background: "linear-gradient(to top, #fff, #f7f7f7)",
          zIndex: 3,
        }}
      />
    </>
  );
};
