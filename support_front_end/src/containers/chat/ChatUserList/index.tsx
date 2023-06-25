import { FC } from "react";
import { Topic } from "../../../types";
import UserCell from "./UserCell/index";
import "../../../assets/style/styling.css";

const ChatUserList: FC<{
  topics: Topic[];
  selectedSectionId: number;
  onSelectTopic: React.Dispatch<React.SetStateAction<Topic | null>>;
}> = ({ topics, selectedSectionId, onSelectTopic }) => {
  const sortedTopics = topics
    .slice()
    .sort((a, b) => b.unreadMessages - a.unreadMessages);

  return (
    <div className="chat-user">
      {sortedTopics
        .map((topic, index) => (
          <UserCell
            key={index}
            topic={topic}
            selectedSectionId={selectedSectionId}
            onSelectTopic={onSelectTopic}
          />
        ))}
    </div>
  );
};

export default ChatUserList;
