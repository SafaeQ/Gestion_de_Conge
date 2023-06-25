import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.PROD && !(import.meta.env.VITE_STAGE === "true")
    ? "https://api.ticketings.org"
    : import.meta.env.DEV
    ? "http://localhost:4001"
    : "http://65.109.179.27:4001";

export const socket= io(SOCKET_URL, {
  transports: ["websocket"],
});
