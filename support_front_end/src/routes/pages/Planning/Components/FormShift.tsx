import { CloseCircleTwoTone, PlusCircleFilled } from "@ant-design/icons";
import "./styles/Home.css";
import {
  FloatButton,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Tabs,
} from "antd";
import { Tab } from "rc-tabs/lib/interface";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";
import { Entity, ROLE, User } from "../../../../types";
import { transport } from "../../../../util/Api";
import { TimeType } from "../context/planningContext";
import DragShifts from "./DragShifts";

interface FormProps {
  times: TimeType[];
}

export const FormShift = ({ times }: FormProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm<TimeType>();
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const handleCancel = () => {
    setIsOpen(false);
  };

  const createShiftsMutation = useMutation<
    any,
    unknown,
    { value: string; bgColor: string; user: User; entity: Entity }
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
          user: user as User,
          entity: user?.entity as Entity,
        };
        // if (
        //   times?.find(
        //     (el) => el.value === dataTime.value && el.user.id === user?.id
        //   ) != null
        // ) {
        //   void message.error("shift already exists");
        //   return;
        // }
        createShiftsMutation.mutate(dataTime);
      })
      .catch((err) => console.log(err));
  };

  // delete Shifts after create
  const deleteShiftss = useMutation(
    async (time: TimeType) =>
      await transport
        .post(`/shifts/${time?.id}`, { deleted: true })
        .then((res: any) => res.data),
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
    deleteShiftss.mutate(time);
  };

  const cancel = () => {
    void message.error("Canceled");
  };

  // this function for display the shift of the chef user in teamleader account according to the entity ✌💫
  const shiftByEntity = () =>
    times
      .filter(
        (t) =>
          !t.deleted &&
          t.todelete &&
          t.user?.role === ROLE.CHEF &&
          t.entity?.id === user?.entity.id
      )
      .map((time) => {
        return (
          <div key={Math.random()}>
            <>
              <DragShifts
                id={time.id}
                bgColor={time.bgColor}
                startTime={time.value}
                endTime={time.endTime}
                key={time.id}
              />
              {time.todelete ? (
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
      });

  const renderAddShiftModal = () => (
    <Modal
      title="Add Shift"
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
              {user?.role === ROLE.TEAMLEADER ? shiftByEntity() : null}
              {times
                .filter(
                  (u: any) =>
                    (u.todelete === false && u.holiday === false) ||
                    (u.user?.id === user?.id && u.deleted === false)
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
                  <div key={Math.random()}>
                    <>
                      <DragShifts
                        id={time.id}
                        bgColor={time.bgColor}
                        startTime={time.value}
                        holiday={time.holiday}
                        key={time.id}
                      />
                    </>
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
      {/* {shiftByEntity()} */}
      {renderAddShiftModal()}
      <Tabs
        type="card"
        tabPosition={"top"}
        items={items}
        centered
        animated={true}
        style={{
          padding: 10,
          boxShadow: "#64646f33 0px  1px 4px",
          height: "100%",
          // width: "30%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          // alignSelf: "flex-end",
          // height: 150,
          // marginTop: 30,
          position: "relative",
          // left: "30%",
          // top: "6%",
          background: "linear-gradient(to top, #fff, #f7f7f7)",
          zIndex: 3,
        }}
      />
    </>
  );
};
