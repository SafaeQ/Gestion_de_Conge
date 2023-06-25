import { FC, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../appRedux/store";
import { socket } from "../../../context/socket.provider";
import { Chat, Topic, User } from "../../../types";
import ReceivedMessageCell from "./ReceivedMessageCell/index";
import SentMessageCell from "./SentMessageCell/index";
import img from "../../../assets/img/chat.jpg";

const Conversation: FC<{ conversationData: Chat[]; selectedTopic: Topic }> = ({
  conversationData,
  selectedTopic,
}) => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  /* Emitting a socket event to the server. */
  useEffect(() => {
    socket.emit(`read:message`, selectedTopic);
  }, []);

  return (
    <div className="chat-main-content" style={{ padding: 10, width: "100%" }}>
      {conversationData.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "2%",
          }}
        >
          <div
            style={{
              boxShadow: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
              width: 200,
              height: 200,
              borderRadius: 100,
            }}
          >
            <img
              src={img}
              style={{
                display: "flex",
                justifyContent: "center",
                alignSelf: "center",
                marginBottom: 10,
                width: 200,
                height: 200,
                borderRadius: 100,
              }}
            />
          </div>
          <h3>No Message Yet.</h3>
          <div>
            <p style={{ color: "GrayText" }}>
              Once you send a message you will see it here.
            </p>
          </div>
        </div>
      ) : (
        conversationData.map((conversation, index: any) =>
          conversation.from.id === user?.id ? (
            <SentMessageCell key={index} conversation={conversation} />
          ) : (
            <ReceivedMessageCell key={index} conversation={conversation} />
          )
        )
      )}
    </div>
  );
};

export default Conversation;
