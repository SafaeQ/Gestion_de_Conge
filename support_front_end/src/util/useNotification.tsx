import { BellOutlined } from "@ant-design/icons";
// import { notification } from 'antd'
import addNotification from "react-push-notification";
import { toast } from "react-toastify";
import { Ticket, User } from "../types";

export const useNotification = (
  user: User | undefined,
  ticket: Ticket,
  message: string
) => {
  // depending on user role and condition, we will pop up a notification
  if (
    user?.role === "CHEF" &&
    user?.departements
      .map((depart) => depart.id)
      .includes(ticket.departement.id) &&
    user.access_entity.includes(ticket.entity?.id)
  ) {
    toast(message, {
      data: `Ticket #${ticket.id}`,
      position: "top-right",
      icon: <BellOutlined style={{ color: "red" }} />,
    });
    addNotification({
      title: "Ticketings.org",
      message,
      theme: "darkblue",
      duration: 20000000,
      native: true, // when using native, your OS will handle theming.
    });
  } else if (
    user?.team !== undefined &&
    user.team.id === ticket.target_team?.id &&
    user.access_entity.includes(ticket.entity?.id)
  ) {
    toast(message, {
      data: `Ticket #${ticket.id}`,
      position: "top-right",
      icon: <BellOutlined style={{ color: "red" }} />,
    });
    addNotification({
      title: "Ticketings.org",
      message,
      theme: "darkblue",
      duration: 20000000,
      native: true, // when using native, your OS will handle theming.
    });
  }
};
