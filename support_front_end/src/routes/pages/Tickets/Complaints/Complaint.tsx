import { Button, Popover, Table } from "antd";
import React from "react";
import { Complaints, ROLE, User } from "../../../../types";
import { ColumnProps } from "antd/es/table";
import dayjs from "dayjs";
import { CheckOutlined, CommentOutlined } from "@ant-design/icons";
import Read from "../../../../containers/chat/Conversation/read";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";
import { Link } from "react-router-dom";

const Complaint = ({
  Complaints,
  isLoadingData,
}: {
  Complaints: Complaints[] | undefined;
  isLoadingData: boolean;
}) => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  const columns: Array<ColumnProps<Complaints>> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (_, record) => (
        <Link to={`/complaints/edit/${record.id}`}>{record.id}</Link>
      ),
    },
    {
      title: "Name",
      dataIndex: "user",
      key: "user",
      render: (_, record) =>
        user?.id === record.user?.id ? "You" : record.user?.name,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (_, record) => record.subject,
    },
    {
      title: "Date",
      key: "createAt",
      dataIndex: "createAt",
      render: (_, record) =>
        dayjs(record.createdAt).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
    {
      title: "Updates",
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (_, record) =>
        dayjs(record.updatedAt).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
      responsive: ["xxl"],
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (_, record) => {
        return (
          <Popover
            content={
              <div>
                {record.message}
                {user?.role !== ROLE.CHEF ? (
                  <>
                    <Read show={record.seen} />
                    <>
                      {!record.seen ? (
                        <CheckOutlined style={{ color: "#4fc3f7" }} />
                      ) : null}
                    </>
                  </>
                ) : null}
              </div>
            }
            trigger="click"
          >
            <Button shape="circle" icon={<CommentOutlined />} />
          </Popover>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        loading={isLoadingData}
        bordered={true}
        rowKey="id"
        pagination={{ pageSize: 9 }}
        columns={columns}
        dataSource={Complaints}
      />
    </div>
  );
};

export default Complaint;
