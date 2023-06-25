import DragShifts from "./DragShifts";
import { useContext, useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { transport } from "../../../../util/Api";
import { message, Popconfirm } from "antd";
import { PlanningType, TimeType, context } from "../context/planningContext";
import { ROLE, User } from "../../../../types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../appRedux/store";
import { useMutation } from "react-query";
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
  const currnetUser = useSelector<RootState, User | undefined>(
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

  async function deleteItem2() {
    if (
      currnetUser?.role === ROLE.TEAMLEADER ||
      currnetUser?.role === ROLE.CHEF
    ) {
      // current => get one element from the list of planning
      const current = planning.find((p) => {
        return p.user.id === user.id && dayjs(p.day).isSame(day, "day");
      });

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
        void message.success("The Shift is deleted successfully");
        return await Promise.resolve("local");
      }
    }
  }

  // delete shifts request
  const deleteShiftMutation = useMutation(deleteItem2, {
    onError: async () => {
      await message.error("Somthing went wrong");
    },
  });

  const deletePlanning = () => {
    deleteShiftMutation.mutate();
  };

  const cancel = () => {
    void message.error("Is Canceled");
  };

  // show delete btn
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
    if (currnetUser?.role === ROLE.CHEF) {
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
    return null;
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
        {currnetUser?.role === ROLE.TEAMLEADER ||
        currnetUser?.role === ROLE.CHEF ? (
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
                    endTime={board?.endTime}
                    id={board?.id ?? 0}
                    bgColor={board?.bgColor}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {board !== undefined && (
              <div className="card-holder">
                <div>
                  <DragShifts
                    key={boxDay}
                    startTime={board?.value}
                    endTime={board?.endTime}
                    id={board?.id ?? 0}
                    bgColor={board?.bgColor}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default CellComponent;
