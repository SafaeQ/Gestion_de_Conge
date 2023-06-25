import { FC } from 'react'
import { DragSourceMonitor, useDrag } from 'react-dnd'

interface DragProps {
  id: number
  startTime?: string
  endTime?: string
  bgColor?: string
  holiday?: string
}

const DragShifts: FC<DragProps> = ({ id, startTime, endTime, bgColor }) => {
  // drag shifts
  const [, drag] = useDrag<{ id: number }>(() => ({
    type: 'p',
    item: { id },
    collect: (monitor: DragSourceMonitor<unknown>) => ({
      isDragging: monitor.isDragging()
    })
  }))

  if (id !== 0) {
    return (
      <p
        ref={drag}
        className='draggable'
        draggable='true'
        style={{ backgroundColor: bgColor }}
      >
        {startTime} {endTime}
      </p>
    )
  } else {
    return null
  }
}

export default DragShifts
