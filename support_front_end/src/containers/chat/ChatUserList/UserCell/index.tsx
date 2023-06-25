import { RightCircleTwoTone } from "@ant-design/icons";
import { Avatar, Badge, Tag, Typography } from "antd";
import dayjs from "dayjs";
import React, { FC } from "react";
import { Topic, TopicStatus } from "../../../../types";
import "../../../../assets/style/styling.css";

const { Title, Text } = Typography;

const UserCell: FC<{
  selectedSectionId: number;
  topic: Topic;
  onSelectTopic: React.Dispatch<React.SetStateAction<Topic | null>>;
}> = ({ topic, selectedSectionId, onSelectTopic }) => {
  return (
    <div
      className={`chat-user-item ${
        selectedSectionId === topic.id ? "active" : ""
      }`}
      onClick={() => {
        onSelectTopic(topic);
      }}
      style={{
        height: "100%",
        background: `${
          selectedSectionId === topic?.id ? "rgb(148 197 233 / 51%)" : ""
        }`,
        borderRadius: 30,
        marginBottom: 4,
        padding: 4,
      }}
    >
      <div
        className="gx-chat-user-row"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div>
            <Avatar
              style={{
                backgroundColor: "#f56a00",
                verticalAlign: "middle",
                marginRight: 10,
                marginTop: 20,
              }}
              size="large"
              gap={2}
            >
              #{topic.id}
            </Avatar>
          </div>
          <Title level={4}>
            {topic?.from.name} <RightCircleTwoTone /> {topic?.to.name}
          </Title>
        </div>
        <div
          style={{
            position: "relative",
            right: 27,
            top: 29,
          }}
        >
          {topic?.unreadMessages !== 0 && topic.unreadMessages > 0 ? (
            <Badge count={topic.unreadMessages} />
          ) : null}
        </div>
      </div>
      <div className="subjet">
        <Text>{topic?.subject}</Text>
      </div>
      <div
        style={{
          margin: 6,
          marginTop: 10,
        }}
        className="group-footer"
      >
        <div className="gx-chat-date" style={{ color: "GrayText" }}>
          {dayjs(topic.createdAt).add(1, "hour").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div className="gx-chat-info">
          <Tag
            color={
              topic?.status === TopicStatus.COMPLETED ? "#52c41a" : "#69c0ff"
            }
          >
            {topic?.status}
          </Tag>
        </div>
      </div>
    </div>
  );
};

export default UserCell;
