import { Avatar, Popover } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../appRedux/store";
import { User } from "../../types";

const baseURL =
  import.meta.env.PROD && !(import.meta.env.VITE_STAGE === "true")
    ? "https://api.ticketings.org"
    : import.meta.env.DEV
    ? "http://localhost:4001"
    : "http://65.109.179.27:4001";

const UserProfile = () => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  return (
    <div className="gx-flex-row gx-align-items-center gx-mb-4 gx-avatar-row">
      <Popover placement="bottomRight" open={false} trigger="click">
        <Avatar
          src={`${baseURL}/support.png`}
          className="gx-size-40 gx-pointer gx-mr-3"
          alt=""
        />
        <span className="gx-avatar-name">
          {user?.username != null || "John Doe"}
          <i className="icon icon-chevron-down gx-fs-xxs gx-ml-2" />
        </span>
      </Popover>
    </div>
  );
};

export default UserProfile;
