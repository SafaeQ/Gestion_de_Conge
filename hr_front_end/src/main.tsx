import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./containers/App/index";
import store from "./appRedux/store";
import { Notifications } from "react-push-notification";
import { ConfigProvider } from "antd";
import en_US from "antd/es/locale/en_US";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CheckToken from "./routes/checkToken";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const queryClient = new QueryClient();

function Main() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <CheckToken />
      <Notifications />
      <Provider store={store}>
        <BrowserRouter>
          <ConfigProvider
            locale={en_US}
            theme={{
              token: {
                colorPrimary: "#1677ff",
              },
            }}
          >
            <DndProvider backend={HTML5Backend}>
              <App />
            </DndProvider>
          </ConfigProvider>
        </BrowserRouter>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Main />
);
