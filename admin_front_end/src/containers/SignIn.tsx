import { Button, Card, Form, Input, message, Typography } from "antd";
import { LockOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { useMutation } from "react-query";
import { transport } from "../util/Api";
import { css } from "@emotion/css";
import "../assets/style/styling.css";
interface LoginType {
  username: string;
  password: string;
}

const baseURL =
  import.meta.env.PROD && !(import.meta.env.VITE_STAGE === "true")
    ? "https://api.ticketings.org"
    : import.meta.env.DEV
    ? "http://localhost:4001"
    : "http://65.109.179.27:4001";

const SignIn = () => {
  const history = useHistory();
  const loginMutation = useMutation(
    async (data: LoginType) =>
      await transport
        .post("/auth/users/admin/signin", data)
        .then((res) => res.data),
    {
      onSuccess: async () => {
        history.push("/departements");
        await message.success("Successful login");
      },
      onError: async ({ response }) => {
        console.log(response);
        await message.error(response?.data?.message);
      },
    }
  );

  const handleSubmit = (values: LoginType) => {
    loginMutation.mutate(values);
  };

  return (
    <div
      className={css`
        height: 100vh;
        width: 100%;
        max-width: 100%;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `}
    >
      <Card className="signin-container">
        <div
          className="gx-d-flex gx-justify-content-center gx-align-content-center gx-flex-1 gx-flex-column"
          style={{ position: "relative", zIndex: 3 }}
        >
          <div className="gx-text-center mb-5">
            <Typography.Title
              className={css`
                align-items: center;
                justify-content: center;
                display: flex;
              `}
            >
              ADMIN
            </Typography.Title>
          </div>
          <img
            width={500}
            height={300}
            src={`${baseURL}/logo.png`}
            alt="Picture of the logo"
          />

          <Form
            name="normal_login"
            className="gx-signin-form"
            onFinish={handleSubmit}
            style={{
              width: 350,
              padding: 20,
              margin: "0 auto 40px",
              borderRadius: 4,
              // background: "#fff",
            }}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your E-mail!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Username"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your Password!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>

            <Button
              icon={<LoginOutlined />}
              data-testid="login"
              type="primary"
              block
              htmlType="submit"
              className="login-form-button"
              loading={loginMutation.isLoading}
            >
              Login
            </Button>
          </Form>
        </div>
        <div
          className="py-2"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <strong className="text-primary">ADS GLORY</strong>
          <span> {new Date().getFullYear()}</span>
        </div>
      </Card>
    </div>
  );
};

export default SignIn;
