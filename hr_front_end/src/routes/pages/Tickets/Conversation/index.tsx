import ReceivedMessageCell from "./ReceivedMessageCell/index";
import SentMessageCell from "./SentMessageCell/index";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useQuery,
  useQueryClient,
} from "react-query";
import useSound from "use-sound";
import { transport } from "../../../../util/Api";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";
import { Ticket, TicketMessage, User } from "../../../../types";
import { memo, useEffect, useRef, useState } from "react";
import { socket } from "../../../../context/socket.provider";
import forSure from "../../../../sounds/for-sure-576.mp3";
import "../../../../assets/style/styling.css";
import { Spin } from "antd";

const Conversation: React.FC<{
  ticketId: number;
  userId: number | undefined;
  ticket: Ticket | null;
  refetch: (
    options?: (RefetchOptions & RefetchQueryFilters<any>) | undefined
  ) => Promise<QueryObserverResult<{ entities: Ticket[] }, unknown>>;
}> = ({ ticketId, refetch }) => {
  const queryClient = useQueryClient();

  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const [messages, loadMessages] = useState<TicketMessage[]>([]);
  const [textMessage] = useState("");
  const ref = useRef(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const [messageSound] = useSound(forSure);
  /* A hook that is used to fetch data from the server. */
  const { refetch: refetchMessages } = useQuery<TicketMessage[]>(
    `getMessages-${ticketId}`,
    async () => {
      if (Number.isInteger(ticketId) && user != null) {
        const res = await transport.get(`/messages/${ticketId}/${user.id}`);
        return res.data;
      }
      return [];
    },
    {
      onSuccess: (messages) => {
        if (ref.current) {
          loadMessages(messages);
          scrollToBottom();
        }
      },
    }
  );

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (chatEnd.current != null)
        chatEnd.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [textMessage]);

  useEffect(() => {
    ref.current = true;
    socket.on(`messageConv-${ticketId}`, async () => {
      console.log("messageCreated");
      await refetchMessages();
      messageSound();
    });
    socket.on("ticket:message:sent", async () => {
      await refetchMessages();
    });
    return () => {
      console.log("conversation unsubscribe");
      ref.current = false;
      socket.removeListener(`messageConv-${ticketId}`);
      socket.removeListener("ticket:message:sent");
      void refetch();
    };
  }, [queryClient]);

  return (
    <div
      style={{
        overflow: "hidden",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
      className="card-msg"
    >
      <div className="chat-main-content">
        {messages.length > 0 ? (
          messages.map((message, index) =>
            message.user?.id === user?.id ? (
              <SentMessageCell key={index} conversation={message} />
            ) : (
              <ReceivedMessageCell key={index} conversation={message} />
            )
          )
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              width: "100%",
              height: 400,
              bottom: "50%",
              alignSelf: "center",
            }}
          >
            <Spin size="large" />
          </div>
        )}
        <div ref={chatEnd} />
      </div>
    </div>
  );
};

export default memo(Conversation);
