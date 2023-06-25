import { useQuery } from "react-query";
import { transport } from "../util/Api";

const CheckToken = () => {
  useQuery(
    "checkedToken",
    async () => {
      await transport.post("/auth/users/web/verify").then((res) => res.data);
    },
    {
      refetchInterval: 20000,
      refetchIntervalInBackground: true,

      onSuccess(data) {},
    }
  );
  return null;
};

export default CheckToken;
