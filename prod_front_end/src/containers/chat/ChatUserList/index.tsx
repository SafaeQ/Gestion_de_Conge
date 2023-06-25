import { FC } from 'react'
import { Topic } from '../../../types'
import UserCell from './UserCell/index'

const ChatUserList: FC<{
  topics: Topic[]
  selectedSectionId: number
  onSelectTopic: React.Dispatch<React.SetStateAction<Topic | null>>
}> = ({ topics, selectedSectionId, onSelectTopic }) => {
  return (
    <div className='chat-user'>
      {topics
        .sort((a, b) => (a.unreadMessages > b.unreadMessages ? -1 : 1))
        .map((topic, index) => (
          <UserCell
            key={index}
            topic={topic}
            selectedSectionId={selectedSectionId}
            onSelectTopic={onSelectTopic}
          />
        ))}
    </div>
  )
}

export default ChatUserList
