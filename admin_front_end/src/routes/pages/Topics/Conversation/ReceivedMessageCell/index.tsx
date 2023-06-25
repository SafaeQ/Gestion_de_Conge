import { Avatar, Button, Image, Tooltip } from 'antd'
import dayjs from 'dayjs'
import parse from 'html-react-parser'
import DOMPurify from 'dompurify'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { Message } from '../../../../../types'
import { DownloadOutlined } from '@ant-design/icons'
import { download } from '../../../../../util/Api'
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

const ReceivedMessageCell = ({ conversation }: { conversation: Message }) => {
  const renderMessage = () => {
    if (
      !conversation.msg.startsWith('file:') &&
      !conversation.msg.startsWith('image:')
    ) {
      if (conversation.msg.includes('**')) {
        return parse(DOMPurify.sanitize(encode(conversation.msg)))
      } else {
        return parse(
          DOMPurify.sanitize(
            encode(conversation.msg).replace(/\*{1}(.*?)\*{1}/g, '<b>$1</b>')
          )
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
    <div className='gx-chat-item'>
      <Tooltip title={conversation.topic.subject}>
        <Avatar
          className='gx-size-40 gx-align-self-end'
          alt={conversation.to.username}
        >
          {conversation.to.username.split('')[0]}
        </Avatar>
      </Tooltip>

      <div className='gx-bubble-block'>
        <div className='gx-bubble'>
          <div style={{ whiteSpace: 'pre-line' }} className='gx-message'>
            {renderMessage()}
          </div>
          <div className='gx-time gx-text-muted gx-text-right gx-mt-2'>
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
