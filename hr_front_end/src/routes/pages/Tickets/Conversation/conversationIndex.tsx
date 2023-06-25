import React, { Key, useEffect, useRef, useState } from "react";
import { TICKET_STATUS, Ticket, User } from "../../../../types";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
} from "react-query";
import {
  Alert,
  Button,
  Drawer,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
} from "antd";
import Conversation from ".";
import UploadFile from "../Upload";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { socket } from "../../../../context/socket.provider";
import { transport } from "../../../../util/Api";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";

const ChatDrawer: React.FC<{
  ticketId: number;
  userId: number | undefined;
  ticket: Ticket | null;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetch: (
    options?: (RefetchOptions & RefetchQueryFilters<any>) | undefined
  ) => Promise<QueryObserverResult<{ entities: Ticket[] }, unknown>>;
}> = ({ ticketId, refetch, userId, ticket, open, setOpen }) => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const chatEnd = useRef<HTMLDivElement>(null);
  const [textMessage, setMessage] = useState("");
  const updateMutation = useMutation<
    any,
    unknown,
    { ids: Key[]; status: TICKET_STATUS }
  >(
    async ({ ids, status }) =>
      await transport
        .post(`/tickets/updateStatusForTickets`, {
          ids,
          status,
          assigned_to: user?.id ?? null,
          resolved_by: user?.name,
        })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        socket.emit("updatedTicket", ticketId);
        await refetch();
        await message.success(`Tickets has been updated.`);
      },
      onError: async () => {
        await message.error("Error Updating");
      },
    }
  );

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      const body = textMessage.replace(/$\s+|^\s+|^\n+|\n+$/g, "");
      const newMessage = {
        body: textMessage.replace(/$\s+|^\s+|^\n+|\n+$/g, ""),
        user,
        ticket: ticketId,
      };
      if (body.length > 0 && body.replace(/\s/g, "").length > 0) {
        socket.emit("createMessage", newMessage);
        setMessage("");
      }
    }
  };

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
  }, [textMessage, open]);
  return (
    <Drawer
      title={
        <div>
          <h3 className="gx-mt-2">
            <Tag color="cyan">#{ticket?.id} </Tag>{" "}
            {ticket !== null && ticket.subject.length > 40 ? (
              <Tooltip placement="topLeft" title={ticket?.subject}>
                {ticket?.subject.substring(0, 40) + "..."}
              </Tooltip>
            ) : (
              ticket?.subject
            )}{" "}
            {ticket !== null && ticket.related_ressource.length > 40 ? (
              <Tooltip placement="topLeft" title={ticket?.related_ressource}>
                {ticket?.related_ressource.substring(0, 40) + "..."}
              </Tooltip>
            ) : (
              ticket?.related_ressource
            )}
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            {ticket?.status === TICKET_STATUS.Closed ? (
              <>
                <h5>Closed By &nbsp;</h5>
                <div style={{ marginBottom: 18 }}>
                  <Tag color="red">{ticket?.closed_by}</Tag>
                </div>
                {ticket?.closed_by !== "" && ticket?.resolved_by !== "" ? (
                  <>
                    <h5>Resolved By &nbsp;</h5>
                    <div style={{ marginBottom: 18 }}>
                      <Tag color="green">{ticket?.resolved_by}</Tag>
                    </div>
                  </>
                ) : null}
              </>
            ) : ticket?.status === TICKET_STATUS.Resolved ? (
              <>
                <h5>Resolved By &nbsp;</h5>
                <div style={{ marginBottom: 18 }}>
                  <Tag color="green">{ticket.resolved_by}</Tag>
                </div>
              </>
            ) : null}
          </div>
          {ticket !== null && ticket.notes.length > 0 ? (
            <Alert className="gx-mt-2" message={ticket.notes} type="warning" />
          ) : null}
        </div>
      }
      placement={"right"}
      size={"large"}
      onClose={() => setOpen(false)}
      open={open}
      key={ticket?.id}
      headerStyle={{
        backgroundColor: "#fff",
        boxShadow: "inset rgba(100, 100, 111, 0.2) 0px -1px 7px 0px",
      }}
      bodyStyle={{ backgroundColor: "#f0f4f7" }}
      footer={
        <div className="footer-msg">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 10,
            }}
          >
            <Input.TextArea
              onClick={() => scrollToBottom()}
              onKeyDown={handleKeyPress}
              autoSize={{ minRows: 2, maxRows: 5 }}
              value={textMessage}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Type a message"
              style={{ marginRight: 9, backgroundColor: "#f0f4f7" }}
            />
            <UploadFile ticketId={ticketId} />
          </div>
          <Space>
            {userId !== user?.id ? (
              <Button
                loading={updateMutation.isLoading}
                onClick={() => {
                  updateMutation.mutate({
                    ids: [ticketId],
                    status: TICKET_STATUS.In_Progress,
                  });
                }}
                icon={<ClockCircleOutlined />}
                style={{ color: "white", backgroundColor: "blue" }}
                className="mt-2 bg-info"
                color="info"
              >
                Mark as In progress
              </Button>
            ) : null}

            {ticket?.status === TICKET_STATUS.Resolved ||
            ticket?.status === TICKET_STATUS.Closed ? null : (
              <Button
                loading={updateMutation.isLoading}
                onClick={() => {
                  updateMutation.mutate({
                    ids: [ticketId],
                    status: TICKET_STATUS.Resolved,
                  });
                }}
                style={{
                  color: "white",
                  backgroundColor: "green",
                  marginLeft: 10,
                }}
                icon={<CheckCircleOutlined />}
                className="mt-2 bg-green"
              >
                Mark as Resolved
              </Button>
            )}
            {ticket?.status === TICKET_STATUS.Resolved ||
            ticket?.status === TICKET_STATUS.Closed ? (
              userId !== user?.id ? null : (
                <Button
                  loading={updateMutation.isLoading}
                  onClick={() => {
                    updateMutation.mutate({
                      ids: [ticketId],
                      status: TICKET_STATUS.Reopened,
                    });
                  }}
                  style={{
                    color: "white",
                    backgroundColor: "orange",
                    marginLeft: 10,
                  }}
                  icon={<CheckCircleOutlined />}
                  className="mt-2 bg-green"
                >
                  ReOpened
                </Button>
              )
            ) : null}
          </Space>
        </div>
      }
    >
      <Conversation
        refetch={refetch}
        ticketId={ticketId}
        ticket={ticket}
        userId={userId}
      />
    </Drawer>
  );
};

export default ChatDrawer;
