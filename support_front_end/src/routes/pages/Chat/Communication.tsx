import {
  Alert,
  Button,
  Card,
  FloatButton,
  Input,
  message,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useSelector } from "react-redux";
import useSound from "use-sound";
import { RootState } from "../../../appRedux/store";
import Conversation from "../../../containers/chat/Conversation";
import { socket } from "../../../context/socket.provider";
import { Chat, Topic, TopicStatus, User } from "../../../types";
import { transport } from "../../../util/Api";
import forSure from "../../../sounds/for-sure-576.mp3";
import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  CommentOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import UploadFile from "./Upload";
import "../../../assets/style/styling.css";
const { Title } = Typography;

const Communication: FC<{
  selectedTopic: Topic;
  onSelectTopic: React.Dispatch<React.SetStateAction<Topic | null>>;
  onShowUsers: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ selectedTopic, onShowUsers, onSelectTopic }) => {
  const [textMessage, setMessage] = useState("");
  const [conversationData, setConversationData] = useState<Chat[]>([]);
  const chatEnd = useRef<HTMLDivElement>(null);
  const [messageSound] = useSound(forSure);
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  /* A react-query hook that is fetching the chat messages from the server. */
  const { refetch } = useQuery<Chat[]>(
    ["chatMessages", selectedTopic],
    async () =>
      await transport
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .get(`/conversations?topic=${selectedTopic?.id}&me=${user?.id}`)
        .then((res) => res.data),
    {
      enabled: Number.isInteger(selectedTopic?.id),
      refetchInterval: 2000,
      onSuccess: (data) => {
        if (data != null) {
          setConversationData(data);
        }
      },
    }
  );

  const updateTopicMutation = useMutation(
    async ({
      status,
      updatedby,
    }: {
      status: string;
      updatedby: number | null;
    }) =>
      await transport
        .put(`/conversations/topics/update/${selectedTopic.id}`, {
          status,
          updatedby,
        })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        void message.success("Topic Updated");
        onSelectTopic(null);
      },
      onError: async () => {
        void message.error("Error Updating");
      },
    }
  );

  const submitMessage = () => {
    const body = textMessage.replace(/$\s+|^\s+|^\n+|\n+$/g, "");
    const newMessage = {
      msg: textMessage.replace(/$\s+|^\s+|^\n+|\n+$/g, ""),
      from: user?.id,
      to:
        selectedTopic.to.id === user?.id
          ? selectedTopic.from.id
          : selectedTopic.to.id,
      topic: selectedTopic.id,
    };
    if (body.length > 0 && body.replace(/\s/g, "").length > 0) {
      socket.emit("send:message", newMessage);
      setMessage("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      submitMessage();
    }
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (chatEnd.current != null)
        chatEnd.current.scrollIntoView({ behavior: "smooth" });
    });
  };

  /* This is a react hook that is called when the component is mounted. It is subscribing to the socket
  event `received:message` and when the event is triggered, it is playing a sound and refetching the
  chat messages. */
  useEffect(() => {
    scrollToBottom();
    socket.on(`received:message`, async (message: Chat) => {
      if (message.to.id === user?.id) {
        messageSound();
        await refetch();
        scrollToBottom();
      }
    });
    socket.on(`message:sent`, async () => {
      await refetch();
      scrollToBottom();
      await message.success("message sent");
    });
    return () => {
      console.log("conversation unsubscribe");
      socket.removeListener(`received:message`);
      socket.removeListener(`message:sent`);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [textMessage]);

  return (
    <Card
      className="gx-chat-main"
      title={
        <div
          className="gx-chat-main-header"
          style={{
            boxShadow: "rgba(0, 0, 0, 0.09) 0px 3px 12px",
            padding: 5,
          }}
        >
          <div className="btn-msg" onClick={() => onShowUsers(true)}>
            <Tooltip
              title="Click to open the list of messages"
              trigger="click"
              defaultOpen
            >
              <FloatButton
                icon={<CommentOutlined />}
                type="primary"
                style={{ right: 24, bottom: 60 }}
              />
            </Tooltip>
            {/* <CommentOutlined /> */}
          </div>

          <div
            className="gx-chat-main-header-info"
            style={{
              width: "100%",
            }}
          >
            <div
              className="gx-chat-contact-name"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Title level={3}>
                {selectedTopic.from.name} <ArrowRightOutlined />
                {selectedTopic?.to.name}
              </Title>
              <div style={{ marginTop: 20 }}>
                <Tag color="cyan">#{selectedTopic.id}</Tag>
              </div>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "10px",
              paddingBottom: 20,
            }}
          >
            <Button
              style={{ padding: "0px 18px" }}
              shape="round"
              loading={updateTopicMutation.isLoading}
              onClick={() =>
                updateTopicMutation.mutate({
                  status: TopicStatus.COMPLETED,
                  updatedby: user?.id ?? null,
                })
              }
              icon={<CheckOutlined />}
              disabled={selectedTopic.status === TopicStatus.COMPLETED}
              type="primary"
            >
              Mark as Completed
            </Button>
            <Button
              style={{ padding: "0px 18px" }}
              shape="round"
              loading={updateTopicMutation.isLoading}
              disabled={selectedTopic.status === TopicStatus.OPEN}
              onClick={() =>
                updateTopicMutation.mutate({
                  status: TopicStatus.OPEN,
                  updatedby: user?.id ?? null,
                })
              }
              icon={<RollbackOutlined />}
              type="default"
            >
              Reopen
            </Button>

            <Button
              onClick={() => scrollToBottom()}
              icon={<ArrowDownOutlined />}
            >
              Scroll To bottom
            </Button>
          </div>
        </div>
      }
      actions={[
        <div
          className="chat-main-footer"
          key={1}
          style={{
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            margin: 0,
          }}
        >
          <div
            className="flex-row gx-align-items-center"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              margin: 0,
            }}
          >
            <div className="col" style={{ width: "100%", marginRight: 20 }}>
              <div className="form-group">
                <Input.TextArea
                  id="required"
                  autoSize={{ minRows: 2, maxRows: 5 }}
                  onClick={() => scrollToBottom()}
                  onKeyDown={handleKeyPress}
                  onChange={(e) => setMessage(e.target.value)}
                  value={textMessage}
                  placeholder="Type and hit enter to send message"
                  style={{ marginRight: 9, backgroundColor: "#f0f4f7" }}
                />
              </div>
            </div>
            <UploadFile selectedTopic={selectedTopic} />
          </div>
        </div>,
      ]}
      bodyStyle={{ padding: 0 }}
      headStyle={{
        backgroundColor: "#fff",
        boxShadow: "inset rgba(100, 100, 111, 0.2) 0px -1px 7px 0px",
      }}
    >
      <div
        style={{
          height: "63vh",
          maxHeight: "calc(105vh - 410px)",
          overflowY: "auto",
          width: "100%",
          paddingBottom: 10,
          backgroundColor: "#f0f4f7",
        }}
      >
        <Conversation
          selectedTopic={selectedTopic}
          conversationData={conversationData}
        />
        <div
          className="gx-chat-item"
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          {selectedTopic.updatedby != null ? (
            <Alert
              className="gx-mt-2"
              message={`updated by ${selectedTopic.updatedby.name} to ${selectedTopic.status}`}
              type="warning"
            />
          ) : null}
        </div>
        <div ref={chatEnd} />
      </div>
    </Card>
  );
};

export default Communication;
