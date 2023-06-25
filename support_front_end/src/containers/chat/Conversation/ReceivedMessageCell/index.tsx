import { Avatar, Button, Image, Tooltip } from 'antd'
import { FC } from 'react'
import { Chat, USER_STATUS } from '../../../../types'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import parse from 'html-react-parser'
import DOMPurify from 'dompurify'
import { DownloadOutlined } from '@ant-design/icons'
import { download } from '../../../../util/Api'
import '../../../../routes/pages/Chat/chat.less'
import { encode } from 'html-entities'

dayjs.extend(timezone)
dayjs.extend(utc)
dayjs().tz('Africa/Casablanca')

const downloadURL =
  import.meta.env.PROD && !(import.meta.env.VITE_STAGE === 'true')
    ? 'https://api.ticketings.org'
    : import.meta.env.DEV
    ? 'http://localhost:4001'
    : 'http://65.109.179.27:4001'

const ReceivedMessageCell: FC<{ conversation: Chat }> = ({ conversation }) => {
  const renderMessage = () => {
    if (
      !conversation.msg.startsWith('file:') &&
      !conversation.msg.startsWith('image:')
    ) {
      if (conversation.msg.includes('**')) {
        return (
          <span> {parse(DOMPurify.sanitize(encode(conversation.msg)))}</span>
        )
      } else {
        return (
          <span>
            {parse(
              DOMPurify.sanitize(
                encode(conversation.msg).replace(
                  /\*{1}(.*?)\*{1}/g,
                  '<span style="font-weight: bold;">$1<span class="bold">'
                )
              )
            )}
          </span>
        )
      }
    } else {
      if (conversation.msg.startsWith('image:')) {
        return (
          <Image
            width={200}
            src={`${downloadURL}/${conversation.msg.split(':')[1]}`}
            preview={{
              src: `${downloadURL}/${conversation.msg.split(':')[1]}`
            }}
          />
        )
      } else {
        return (
          <Button
            icon={<DownloadOutlined />}
            type='link'
            onClick={() =>
              download(
                `${downloadURL}/download/${conversation.msg.split(':')[1]}`
              )
            }
          >
            {conversation.msg.split(':')[1]}
          </Button>
        )
      }
    }
  }
  return (
    <div className='chat-item'>
      {conversation.from.activity === USER_STATUS.ONLINE ? (
        <Tooltip title={conversation.from.name} color={'#1677ff'}>
          <Avatar
            className='size-40 align-self-end'
            alt={conversation.from.username}
          >
            {conversation.from.username.split('')[0]}
          </Avatar>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'green',
              position: 'relative',
              bottom: 10,
              right: 0
            }}
          ></div>
        </Tooltip>
      ) : conversation.from.activity === USER_STATUS.AWAY ? (
        <Tooltip title={conversation.from.name} color={'#1677ff'}>
          <Avatar
            className='size-40 align-self-end'
            alt={conversation.from.username}
          >
            {conversation.from.username.split('')[0]}
          </Avatar>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'orange',
              position: 'relative',
              bottom: 10,
              right: 0
            }}
          ></div>
        </Tooltip>
      ) : (
        <Tooltip title={conversation.from.name} color={'#1677ff'}>
          <Avatar
            className='size-40 align-self-end'
            alt={conversation.from.username}
          >
            {conversation.from.username.split('')[0]}
          </Avatar>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'red',
              position: 'relative',
              bottom: 10,
              right: 0
            }}
          ></div>
        </Tooltip>
      )}

      <div className='bubble-block'>
        <div className='bubble'>
          <div style={{ whiteSpace: 'pre-line' }} className='message'>
            {renderMessage()}
          </div>
          <div
            className='time text-muted text-right mt-2'
            style={{ color: '#97a8b9' }}
          >
            {conversation.from.name}{' '}
            {dayjs(conversation.createdAt)
              .add(1, 'hour')
              .format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceivedMessageCell
