import { memo, useContext, useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { transport } from "../../../../util/Api";
import { message, Popconfirm } from "antd";
import { PlanningType, TimeType, context } from "../context/planningContext";
import { ROLE, User } from "../../../../types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";
import { useMutation } from "react-query";
import DragShifts from "./DragShifts";
import { ClockCircleFilled, DeleteFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { css } from "@emotion/css";

interface CellProps {
  boxDay: number;
  user: User;
  day: string;
  planning: PlanningType[];
}

function CellComponent({ boxDay, user, day, planning }: CellProps) {
  const { setplanning, times } = useContext(context);
  const [currentPlanning, setCurrentPlanning] = useState<
    PlanningType | undefined
  >(undefined);
  const [board, setboard] = useState<TimeType | undefined>(undefined);
  const currentUser = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  const [, drop] = useDrop(
    () => ({
      accept: "p",
      drop: addItem,
      canDrop: () => {
        const itemInState = planning.find((p) => {
          return p.user.id === user.id && dayjs(p.day).isSame(day, "day");
        });

        return itemInState === undefined;
      },
    }),
    [planning]
  );

  // display shifts in the table according to user_id and day
  useEffect(() => {
    if (Array.isArray(planning)) {
      const current = planning.find((p) => {
        return p.user.id === user.id && dayjs(p.day).isSame(day, "day");
      });
      setCurrentPlanning(current);

      const newBoard = times?.find((t) => t.id === current?.shift.id);
      setboard(newBoard);
    }
  }, [planning]);

  // add item boxDay and user_is with time_id in mongodb
  function addItem(item: TimeType) {
    // setting planning and push to it new elements
    setplanning([
      ...planning,
      {
        shift: item,
        boxDay,
        user: user as unknown as User,
        day,
        isSaved: false,
      },
    ]);
    return item;
  }

  // delete shifts request with the access for admin to delete
  async function deleteItem2() {
    if (currentUser?.role === ROLE.ADMIN) {
      const current = planning.find(
        (p) => p.user.id === user.id && dayjs(p.day).isSame(day, "day")
      );

      if (
        current !== undefined &&
        !Object.keys(current as object).includes("isSaved")
      ) {
        const deletePlanning = planning.filter(
          (p) =>
            !(
              dayjs(p.day).format("DD/MM/YYYY") ===
                dayjs(day).format("DD/MM/YYYY") && p.user.id === user.id
            )
        );
        setplanning(deletePlanning);
        setboard(undefined);

        try {
          const res = await transport.delete(`/records/${current.id ?? 0}`);
          void message.success("The Shift is deleted successfully");
          return res.data;
        } catch (error) {
          console.log(error);
          await message.error("Something went wrong");
          throw error;
        }
      } else {
        const deletenewPlanning = [...planning];
        setplanning(() => {
          return deletenewPlanning.filter(
            (p) => !(dayjs(p.day).isSame(day, "day") && p.user.id === user.id)
          );
        });

        setboard(undefined);
        void message.success("The Shift is deleted successfully");
        return await Promise.resolve("local");
      }
    }
  }

  const { mutate } = useMutation(deleteItem2, {
    onError: async (error) => {
      console.log(error);
      await message.error("Somthing went wrong");
    },
  });
  const deletePlanning = () => {
    mutate();
  };
  const cancel = () => {
    void message.error("Is Canceled");
  };

  // show btn delete for admin
  const renderDelete2 = () => {
    if (currentPlanning?.isSaved !== undefined && !currentPlanning?.isSaved) {
      return (
        <Popconfirm
          title="Are you sure to delete this Shift?"
          onConfirm={deletePlanning}
          onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <DeleteFilled
            className={css`
              position: absolute;
              top: 12px;
              right: 12px;
              color: #be1d1d;
              cursor: pointer;
            `}
          />
        </Popconfirm>
      );
    }
    return (
      <Popconfirm
        title="Are you sure to delete this Shift?"
        onConfirm={deletePlanning}
        onCancel={cancel}
        okText="Yes"
        cancelText="No"
      >
        <DeleteFilled
          className={css`
            position: absolute;
            top: 12px;
            right: 12px;
            color: #be1d1d;
            cursor: pointer;
          `}
        />
      </Popconfirm>
    );
  };

  return (
    <>
      <div
        style={{ minHeight: "3rem" }}
        draggable="true"
        className="drop"
        ref={drop}
        key={boxDay}
      >
        <>
          {board !== undefined && (
            <div className="card-holder">
              {renderDelete2()}
              {currentPlanning?.isSaved === undefined ? null : (
                <>
                  <ClockCircleFilled
                    className={css`
                      position: absolute;
                      top: 12px;
                      left: 12px;
                      color: black;
                    `}
                  />
                </>
              )}
              <div>
                <DragShifts
                  key={boxDay}
                  startTime={board?.value}
                  id={board?.id ?? 0}
                  bgColor={board?.bgColor}
                />
              </div>
            </div>
          )}
        </>
      </div>
    </>
  );
}

export default memo(CellComponent);
