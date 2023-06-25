import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "./assets/vendors/gaxon/styles.css";
import App from "./containers/App/index";
import store from "./appRedux/store";
import { ConfigProvider } from "antd";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import en_US from "antd/es/locale/en_US";

const queryClient = new QueryClient();

function Main(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
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
            <App />
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
