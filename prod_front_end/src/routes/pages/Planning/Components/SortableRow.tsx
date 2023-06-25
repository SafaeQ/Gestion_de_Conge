import { MenuOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import React, { memo } from "react";
import { ROLE, User } from "../../../../types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";
import { CSS } from "@dnd-kit/utilities";

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}
// * Row component functional introduce sortbale rows call it in component body row instead of the default row of the table * //
const Row = ({ children, ...props }: RowProps) => {
  // ? UseSortable is for make each row of the table draggable {attributes, listeners} allowing it to be dragged and dropped  *//
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props["data-row-key"],
  });
  const user = useSelector<RootState, User>((state) => state.auth.user);

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  const menuIcon = React.useMemo(
    () =>
      user.role === ROLE.CHEF ? (
        <MenuOutlined
          ref={setActivatorNodeRef}
          style={{ touchAction: "none", cursor: "grab" }}
          {...listeners}
        />
      ) : null,
    [setActivatorNodeRef, listeners]
  );

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if ((child as React.ReactElement).key === "sort") {
          return React.cloneElement(child as React.ReactElement, {
            children: menuIcon,
          });
        }
        return child;
      })}
    </tr>
  );
};
export default memo(Row);
