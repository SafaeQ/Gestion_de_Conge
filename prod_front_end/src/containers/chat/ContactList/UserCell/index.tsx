import { FC, useState } from "react";
import { Avatar } from "antd";
import CreateTopic from "../CreateTopic";
import { User } from "../../../../types";
import Title from "antd/lib/typography/Title";
import { UserOutlined } from "@ant-design/icons";

const UserCell: FC<{
  selectedSectionId: number;
  user: User;
}> = ({ selectedSectionId, user }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <>
      <CreateTopic
        recepient={user}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
      />
      <div
        className={`chat-user-item-contact ${
          selectedSectionId === user.id ? "active" : ""
        }`}
        onClick={() => {
          setIsVisible(true);
        }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          height: "100%",
          width: "100%",
          padding: 10,
        }}
      >
        <div className="chat-user-row">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#f56a00",
                verticalAlign: "middle",
                marginRight: 10,
                marginTop: 20,
              }}
              size="large"
              gap={2}
            />{" "}
            <div className="h4 name">
              <Title level={4}>{user.name}</Title>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserCell;
