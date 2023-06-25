import { useQuery, useQueryClient } from "react-query";
import { download, transport } from "../../../../util/Api";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";
import { Message, User } from "../../../../types";
import { memo, useEffect, useRef, useState } from "react";
import { socket } from "../../../../context/socket.provider";
import { Button, Image, Input, List, Tag } from "antd";
import { DownloadOutlined, RightOutlined } from "@ant-design/icons";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import dayjs from "dayjs";

const baseURL =
  import.meta.env.PROD && !(import.meta.env.VITE_STAGE === "true")
    ? "https://api.ticketings.org"
    : import.meta.env.DEV
    ? "http://localhost:4001"
    : "http://65.109.179.27:4001";
const downloadURL =
  import.meta.env.PROD && !(import.meta.env.VITE_STAGE === "true")
    ? "https://api.ticketings.org"
    : import.meta.env.DEV
    ? "http://localhost:4001"
    : "http://65.109.179.27:4001";

const Conversation: React.FC<{
  topicId: number;
}> = ({ topicId }) => {
  const queryClient = useQueryClient();

  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const [messages, loadMessages] = useState<Message[]>([]);
  const [filteredMessages, onFilter] = useState<Message[]>([]);
  // const [words, setSearchWords] = useState<string[]>([])
  const ref = useRef(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  /* A hook that is used to fetch data from the server. */
  const { refetch: refetchMessages } = useQuery<Message[]>(
    "getTopicMessages",
    async () => {
      return await transport
        .get(`/conversations?topic=${topicId}&me=${user?.id ?? 0}`)
        .then((res) => res.data);
    },
    {
      onSuccess: (messages) => {
        if (ref.current) {
          loadMessages(messages);
          onFilter(messages);
          scrollToBottom();
        }
      },
    }
  );

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (chatEnd.current != null) {
        chatEnd.current.scrollIntoView({ behavior: "smooth" });
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    ref.current = true;
    socket.on(`messageCreated-${topicId}`, async () => {
      await refetchMessages();
    });
    return () => {
      ref.current = false;
      socket.off(`messageCreated-${topicId}`);
      void queryClient.cancelQueries("getTopicMessages");
    };
  }, [queryClient]);

  const renderMessage = (message: string) => {
    if (!message.startsWith("file:") && !message.startsWith("image:")) {
      return parse(
        DOMPurify.sanitize(message.replace(/\*{1}(.*?)\*{1}/g, "<b>$1</b>"))
      );
    } else {
      if (message.startsWith("image:")) {
        return (
          <Image
            width={200}
            src={`${baseURL}/${message.split(":")[1]}`}
            preview={{
              src: `${baseURL}/${message.split(":")[1]}`,
            }}
          />
        );
      } else {
        return (
          <Button
            icon={<DownloadOutlined />}
            type="link"
            onClick={() =>
              download(`${downloadURL}/download/${message.split(":")[1]}`)
            }
          >
            {message.split(":")[1]}
          </Button>
        );
      }
    }
  };

  return (
    <div className="gx-chat-main-content">
      <Input.Search
        placeholder="search"
        allowClear
        onChange={(e) => {
          if (e.target.value.trim().length === 0) {
            void refetchMessages();
            return;
          }
          onFilter(
            messages.filter((messageItem) => {
              return messageItem.msg.includes(e.target.value);
            })
          );
        }}
      />
      <div
        style={{
          maxHeight: "calc(100vh - 300px)",
          overflowY: "auto",
          width: "50rem",
        }}
      >
        <List<Message>
          itemLayout="vertical"
          bordered={true}
          dataSource={filteredMessages}
          renderItem={(item) => (
            <List.Item title={item.topic.subject}>
              <List.Item.Meta
                title={
                  <>
                    {item.from.name} <RightOutlined /> {item.to.name}{" "}
                    {dayjs(item.createdAt)
                      .add(1, "hour")
                      .format("YYYY-MM-DD HH:mm:ss")}
                  </>
                }
                description={
                  <Tag style={{ whiteSpace: "pre-line" }}>
                    {renderMessage(item.msg)}
                  </Tag>
                }
              />
            </List.Item>
          )}
        />
        <div ref={chatEnd} />
      </div>
    </div>
  );
};

export default memo(Conversation);
