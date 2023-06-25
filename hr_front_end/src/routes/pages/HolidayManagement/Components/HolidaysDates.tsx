import React, { Key } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  message,
} from "antd";
import { useMutation, useQuery } from "react-query";
import { transport } from "../../../../util/Api";
import { DaysOff } from "../../../../types";
import { ColumnProps } from "antd/es/table";
import dayjs from "dayjs";
import "../style/holidayStyle.css";
import { DeleteFilled, EditFilled } from "@ant-design/icons";

const HolidaysDates = () => {
  const [form] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = React.useState<DaysOff | null>(
    null
  );
  const [data, setData] = React.useState<DaysOff[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<dayjs.Dayjs | null>(
    null
  );

  // get all holidays
  const { refetch } = useQuery<DaysOff[]>(
    "days-off",
    async () => {
      return await transport.get("/holidays/dates").then((res) => res.data);
    },
    {
      onSuccess: (data) => {
        setData(data);
      },
    }
  );

  // create mutation public holidays
  const { mutate: createMutation } = useMutation<{ daysoff: DaysOff }>(
    async (data) => {
      return await transport.post("/holidays/daysoff/create", {
        daysoff: data,
      });
    },
    {
      onSuccess: async () => {
        void message.success("New day Off is added");
        form.resetFields();
        void refetch();
      },
      onError: async (_err) => {
        void message.error("Error Creating");
      },
    }
  );

  // update mutation of public holidays
  const { mutate: editMutation } = useMutation<any, unknown, { id: Key }>(
    async ({ id }) => {
      const updatedData = form.getFieldsValue();
      return await transport
        .put(`/holidays/update-holiday/${id}`, { daysoff: updatedData })
        .then((res) => res.data);
    },
    {
      onSuccess: async () => {
        void message.success("Holiday updated successfully");
        await refetch();
        // reset form and clear the selected record
        form.resetFields();
        setSelectedRecord(null);
      },
      onError: async () => {
        void message.error("Error updating holiday");
      },
    }
  );

  // delete mutation of public holidays
  const { mutate: deleteMutation } = useMutation<any, unknown, { id: Key }>(
    async ({ id }) => {
      return await transport
        .delete(`/holidays/delete-holiday/${id}`)
        .then((res) => res.data);
    },
    {
      onSuccess: async () => {
        void message.success("Holiday deleted successfully");
        await refetch();
      },
      onError: async () => {
        void message.error("Error deleting holiday");
      },
    }
  );

  //
  const onFinish = () => {
    form
      .validateFields()
      .then((values) => {
        if (selectedRecord) {
          editMutation({ id: selectedRecord.id, ...values });
        } else {
          createMutation({
            ...values,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  //
  const editRecord = (record: DaysOff) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      name: record.name,
      date: dayjs(record.date),
    });
  };

  // confirmation of pop up delete
  const confirmDelete = (id: Key) => {
    deleteMutation({ id });
  };

  // filter by year
  const handleDateRangeChange = (dates: dayjs.Dayjs) => {
    setSelectedYear(dates);
  };

  const filteredDataByYear = data?.filter(
    (item) =>
      dayjs(item.date).format("YYYY") === dayjs(selectedYear).format("YYYY")
  );

  const columns: Array<ColumnProps<DaysOff>> = [
    {
      title: "Id",
      key: "id",
      dataIndex: "id",
      render: (_, record) => record.id,
    },
    {
      title: "Dates",
      dataIndex: "date",
      render: (_, record) => dayjs(record.date).format("DD/MM/YYYY"),
    },
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
      render: (_, record) => record.name,
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <div className="btns-action">
          <Button shape="circle" onClick={() => editRecord(record)}>
            <EditFilled className="edit-icon" />
          </Button>
          <Popconfirm
            key={3}
            title="Are you sure you want to delete this holiday?"
            onConfirm={(e) => confirmDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button shape="circle">
              <DeleteFilled className="delete-icon" />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card
          className="card-submit"
          extra={[
            <h3 key={1}>Add Public Holiday</h3>,
            <Space key={0}>
              <Button
                type="default"
                onClick={() => {
                  form.resetFields();
                  setSelectedRecord(null);
                }}
              >
                Reset
              </Button>
            </Space>,
          ]}
        >
          <Form
            name="dynamic_form_nest_item"
            onFinish={onFinish}
            style={{ maxWidth: 600 }}
            autoComplete="off"
            form={form}
          >
            <div className="form-card">
              <Form.Item
                name="name"
                rules={[{ required: true }]}
                style={{ display: "inline-block", width: "calc(50% - 8px)" }}
              >
                <Input placeholder="Input name " />
              </Form.Item>
              <Form.Item
                name="date"
                rules={[{ required: true }]}
                style={{
                  display: "inline-block",
                  width: "calc(50% - 8px)",
                  margin: "0 8px",
                }}
              >
                <DatePicker />
              </Form.Item>
            </div>
            {selectedRecord ? (
              <Form.Item label=" " colon={false} className="btn-submit">
                <Button type="default" htmlType="submit" className="btn">
                  Save
                </Button>
              </Form.Item>
            ) : (
              <Form.Item label=" " colon={false} className="btn-submit">
                <Button type="primary" htmlType="submit" className="btn">
                  Submit
                </Button>
              </Form.Item>
            )}
          </Form>
        </Card>
      </div>
      <Card
        extra={[
          <h3 key={2}>Public Holidays</h3>,
          <Space key={1}>
            <DatePicker
              key={3}
              onChange={(dates) => {
                handleDateRangeChange(dates as dayjs.Dayjs);
              }}
              picker="year"
              allowClear
              placeholder="search by year"
            />
          </Space>,
        ]}
      >
        <Table
          columns={columns}
          dataSource={selectedYear ? filteredDataByYear : data}
          rowKey={(record) => record.id}
          bordered
        />
      </Card>
    </>
  );
};

export default HolidaysDates;
