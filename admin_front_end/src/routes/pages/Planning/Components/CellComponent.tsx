import { memo, useContext, useEffect, useState } from "react";
import DragShifts from "./DragShifts";
import { PlanningType, TimeType, context } from "../context/planningContext";
import { useDrop } from "react-dnd";
import { transport } from "../../../../util/Api";
import { message, Popconfirm } from "antd";
import { User } from "../../../../types";
import { useMutation } from "react-query";
import { ClockCircleFilled, DeleteFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { css } from "@emotion/css";

interface CellProps {
  boxDay: number;
  user: User;
  day: string;
}

function CellComponent({ boxDay, user, day }: CellProps) {
  const { planning, setplanning, times } = useContext(context);
  const [currentPlanning, setCurrentPlanning] = useState<
    PlanningType | undefined
  >(undefined);
  const [board, setboard] = useState<TimeType | undefined>(undefined);

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

  // add item boxDay and user_id with shift id in db
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

  // delete shifts request
  async function deleteItem() {
    // current => get one element from the list of planning
    const current = planning.find((p) => {
      return p.user.id === user.id && dayjs(p.day).isSame(day, "day");
    });
    if (
      current !== undefined &&
      !Object.keys(current as object).includes("isSaved")
    ) {
      const newPlanning = planning.filter(
        (p) =>
          !(
            dayjs(p.day).format("DD/MM/YYYY") ===
              dayjs(day).format("DD/MM/YYYY") && p.user.id === user.id
          )
      );
      setplanning(newPlanning);
      setboard(undefined);

      try {
        const res = await transport.delete(`/records/${current?.id ?? 0}`);
        void message.success("The Shift is deleted successfully");
        return res.data;
      } catch (error) {
        console.log(error);
        await message.error("Something went wrong");
        throw error;
      }
    } else {
      const newPlanning = [...planning];
      setplanning(() => {
        return newPlanning.filter(
          (p) => !(dayjs(p.day).isSame(day, "day") && p.user.id === user.id)
        );
      });
      setboard(undefined);
      void message.success("The Shift is deleted successfully");
      return await Promise.resolve("local");
    }
  }

  const deleteShiftMutation = useMutation(deleteItem, {
    onError: async () => {
      await message.error("Somthing went wrong");
    },
  });

  const deleteShifts = () => {
    deleteShiftMutation.mutate();
  };

  const cancel = () => {
    void message.error("Is Canceled");
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
              <Popconfirm
                title="Are you sure to delete this Shift?"
                onConfirm={deleteShifts}
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
              {currentPlanning?.isSaved === undefined ? null : (
                <ClockCircleFilled
                  className={css`
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    color: black;
                  `}
                />
              )}
              <>
                <DragShifts
                  key={boxDay}
                  startTime={board?.value}
                  endTime={board?.endTime}
                  id={board?.id ?? 0}
                  bgColor={board?.bgColor}
                />
              </>
            </div>
          )}
        </>
      </div>
    </>
  );
}

export default memo(CellComponent);
