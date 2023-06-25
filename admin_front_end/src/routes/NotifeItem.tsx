import { AuditOutlined } from "@ant-design/icons";
import { Badge, Button } from "antd";
import { useQuery } from "react-query";
import { Complaints } from "../types";
import { transport } from "../util/Api";
import { useHistory } from "react-router-dom";

export const ComplaintItem = () => {
  const { data } = useQuery<Complaints[]>(
    "Complaints",
    async () => await transport.get("/complaints").then((res) => res.data)
  );
  const history = useHistory();

  const unseen = data?.filter((com) => !com.seen);
  return (
    <Badge key={"tags"} count={unseen?.length} size="small">
      <Button shape="circle" onClick={() => history.push("tickets")}>
        <AuditOutlined />
      </Button>
    </Badge>
  );
};
