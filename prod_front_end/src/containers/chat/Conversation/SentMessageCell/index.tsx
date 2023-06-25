import { Avatar, Button, Image, Tooltip } from "antd";
import { Chat } from "../../../../types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Read from "../read";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { DownloadOutlined } from "@ant-design/icons";
import { download } from "../../../../util/Api";
import "../../../../assets/style/styling.css";
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

const SentMessageCell = ({ conversation }: { conversation: Chat }) => {
  const renderMessage = () => {
    if (
      !conversation.msg.startsWith("file:") &&
      !conversation.msg.startsWith("image:")
    ) {
      if (conversation.msg.includes("**")) {
        return parse(DOMPurify.sanitize(encode(conversation.msg)));
      } else {
        return parse(
          DOMPurify.sanitize(encode(conversation.msg)).replace(
            /\*{1}(.*?)\*{1}/g,
            "<b>$1</b>"
          )
        );
      }
    } else {
      if (conversation.msg.startsWith("image:")) {
        return (
          <Image
            width={200}
            src={`${downloadURL}/${conversation.msg.split(":")[1]}`}
            preview={{
              src: `${downloadURL}/${conversation.msg.split(":")[1]}`,
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
                `${downloadURL}/download/${conversation.msg.split(":")[1]}`
              )
            }
          >
            {conversation.msg.split(":")[1]}
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
        <Tooltip title={conversation.from.name} color={"#1677ff"}>
          <Avatar
            className="size-40 align-self-end"
            alt={conversation.from.username}
          >
            {conversation.from.username.split("")[0]}
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
            <Read show={conversation.read.includes(conversation.to.id)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentMessageCell;
