import axios from "axios";
import { setCurrentUser } from "../appRedux/actions/auth";
import store from "../appRedux/store";
import JsFileDownloader from "js-file-downloader";
import type { User } from "../types";

export const baseURL =
  import.meta.env.PROD && !(import.meta.env.VITE_STAGE === "true")
    ? "https://api.ticketings.org/api"
    : import.meta.env.DEV
    ? "http://localhost:4001/api"
    : "http://65.109.179.27:4001/api";

const transport = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

transport.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { status } = error.response;
    if (status === 403) {
      await transport
        .post("/auth/users/support/logout")
        .then(() => {
          store.dispatch(setCurrentUser({} as unknown as User));
          window.location.href = "/signin";
        })
        .catch(() => {
          store.dispatch(setCurrentUser({} as unknown as User));
          window.location.href = "/signin";
        });
    }
    return await Promise.reject(error);
  }
);

const download = (url: string) => {
  const download = new JsFileDownloader({
    url,
    autoStart: false,
    withCredentials: true,
  });

  download
    .start()
    .then(function () {
      console.log("success");
    })
    .catch(function (error: any) {
      console.log(error);
    });
};

export { transport, download };
