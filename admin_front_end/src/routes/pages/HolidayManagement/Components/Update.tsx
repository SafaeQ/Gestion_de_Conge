import { Button, Card, DatePicker, Form, message } from "antd";
import React, { useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { transport } from "../../../../util/Api";
import { Holiday, User } from "../../../../types";
import { RootState } from "../../../../appRedux/store";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/en";
import TextArea from "antd/es/input/TextArea";
import "../style/holidayStyle.css";
import { LeftOutlined } from "@ant-design/icons";

const UpdateRequest = () => {
  const [form] = Form.useForm();
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  // get one request of holiday
  const { data: holiday, isFetched } = useQuery<Holiday>(
    "holiday",
    async () => await transport.get(`/holidays/${id}`).then((res) => res.data)
  );

  const createMutation = useMutation<{ holiday: Holiday }>(
    async (holiday) =>
      await transport
        .put(`/holidays/update/${id}`, { holiday })
        .then((res) => res.data),
    {
      onSuccess: async (data) => {
        console.log(data);
        void message.success(" Request is updated");
        form.resetFields();
      },
      onError: async (_err) => {
        void message.error("Error Updating");
      },
    }
  );

  useEffect(() => {
    const setHolidayFields = () => {
      if (holiday == null) {
        return;
      }

      const holidayFields = {
        ...holiday,
        user: holiday.user?.id,
        from: dayjs(holiday.from),
        to: dayjs(holiday.to),
        notes: holiday.notes,
      };

      form.setFieldsValue(holidayFields);
    };

    if (isFetched) {
      setHolidayFields();
    }
  }, [holiday]);

  const UpdateRequestHandle = () => {
    form
      .validateFields()
      .then((values) => {
        if (user != null)
          createMutation.mutate({
            ...values,
            user: user.id,
          });
        history.goBack();
      })
      .catch((err) => console.log(err));
  };

  const name = holiday?.user as unknown as User;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card
          extra={[
            <h3 key={1}>
              <span>
                {name?.name.replace(name?.name[0], name?.name[0].toUpperCase())}
              </span>
            </h3>,
            <div
              key={2}
              style={{ display: "flex", justifyContent: "", margin: "2%" }}
            >
              <Button
                icon={<LeftOutlined />}
                className="back-btn"
                onClick={() => history.goBack()}
              >
                Go Back
              </Button>
            </div>,
          ]}
          className="bg-container"
          style={{
            width: "70%",
            height: "100%",
          }}
        >
          <Form
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            style={{ marginLeft: "10%" }}
            form={form}
          >
            <Form.Item
              rules={[
                { required: true, message: "Please select the starting date" },
              ]}
              name="from"
              label="From"
            >
              <DatePicker style={{ width: "60%" }} />
            </Form.Item>
            <Form.Item
              rules={[
                { required: true, message: "Please select the ending date" },
              ]}
              name="to"
              label="To"
            >
              <DatePicker style={{ width: "60%" }} />
            </Form.Item>
            <Form.Item
              rules={[{ required: false, max: 40 }]}
              name="notes"
              label="Notes"
            >
              <TextArea
                placeholder="Why you need holiday"
                style={{ width: "60%" }}
              />
            </Form.Item>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button className="req-btn" onClick={() => UpdateRequestHandle()}>
                Submit
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default UpdateRequest;
