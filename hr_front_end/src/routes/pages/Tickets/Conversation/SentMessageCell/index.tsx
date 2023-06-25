import { Avatar, Tooltip, Image, Button } from "antd";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { TicketMessage } from "../../../../../types";
import { DownloadOutlined } from "@ant-design/icons";
import { download } from "../../../../../util/Api";
import { encode } from "html-entities";

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs().tz("Africa/Casablanca");

const downloadURL =
  import.meta.env.PROD && !(import.meta.env.VITE_STAGE === "true")
    ? "https://api.ticketings.org"
    : import.meta.env.DEV
    ? "http://localhost:4001"
    : "http://65.109.179.27:4001";

const SentMessageCell = ({ conversation }: { conversation: TicketMessage }) => {
  const renderMessage = () => {
    if (
      !conversation.body.startsWith("file:") &&
      !conversation.body.startsWith("image:")
    ) {
      if (conversation.body.includes("**")) {
        return parse(DOMPurify.sanitize(encode(conversation.body)));
      } else {
        return parse(
          DOMPurify.sanitize(encode(conversation.body)).replace(
            /\*{1}(.*?)\*{1}/g,
            "<b>$1</b>"
          )
        );
      }
    } else {
      if (conversation.body.startsWith("image:")) {
        return (
          <Image
            width={200}
            src={`${downloadURL}/${conversation.body.split(":")[1]}`}
            preview={{
              src: `${downloadURL}/${conversation.body.split(":")[1]}`,
            }}
          />
        );
      } else {
        return (
          <Button
            icon={<DownloadOutlined />}
            type="link"
            onClick={() =>
              download(
                `${downloadURL}/download/${conversation.body.split(":")[1]}`
              )
            }
          >
            {conversation.body.split(":")[1]}
          </Button>
        );
      }
    }
  };
  return (
    <div
      className="chat-item flex-row-reverse"
      style={{ display: "flex", flexDirection: "row-reverse" }}
    >
      <div style={{ height: 63, display: "flex", alignItems: "end" }}>
        <Tooltip title={conversation.user.username} color={"#1677ff"}>
          <Avatar
            className="size-40 align-self-end"
            alt={conversation.user.username}
          >
            {conversation.user.username.split("")[0]}
          </Avatar>
        </Tooltip>
      </div>

      <div className="bubble-block">
        <div className="bubble">
          <div style={{ whiteSpace: "pre-line" }} className="message">
            {renderMessage()}
          </div>
          <div
            className="time text-muted text-right mt-2"
            style={{ color: "#97a8b9" }}
          >
            {dayjs(conversation.createdAt)
              .add(1, "hour")
              .format("YYYY-MM-DD HH:mm:ss")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentMessageCell;
