import { Button, Card, Form, Input, message } from "antd";
import React, { useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { transport } from "../../../../util/Api";
import { Complaints, User } from "../../../../types";
import { RootState } from "../../../../appRedux/store";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import "../../../../assets/style/styling.css";
import { LeftOutlined } from "@ant-design/icons";

const UpdateComplain = () => {
  const [form] = Form.useForm();
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  // get one request of holiday
  const { data: complaint, isFetched } = useQuery<Complaints>(
    "complaint",
    async () => await transport.get(`/complaints/${id}`).then((res) => res.data)
  );

  const createMutation = useMutation<{ complaint: Complaints }>(
    async (complaint) =>
      await transport
        .put(`/complaints/edit/${id}`, { complaint })
        .then((res) => res.data),
    {
      onSuccess: async (data) => {
        console.log(data);
        void message.success(" Updated successfully ");
        form.resetFields();
      },
      onError: async (_err) => {
        void message.error("Error Updating");
      },
    }
  );

  useEffect(() => {
    const setComplaintFields = () => {
      if (complaint == null) {
        return;
      }

      const complaintFields = {
        ...complaint,
      };

      form.setFieldsValue(complaintFields);
    };

    if (isFetched) {
      setComplaintFields();
    }
  }, [complaint]);

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

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card
          extra={[
            <div
              key={2}
              style={{ display: "flex", justifyContent: "", margin: "2%" }}
            >
              <Button
                className="back-btn"
                icon={<LeftOutlined />}
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
              rules={[{ required: true, message: "Please enter a subject" }]}
              name="subject"
              label="Subject"
            >
              <Input placeholder="Edit a subject" />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, message: "Please enter a message" }]}
              name="message"
              label="Message"
            >
              <Input placeholder="Edit a message" />
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

export default UpdateComplain;
