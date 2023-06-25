import { FC } from 'react'
import { User } from '../../../types'
import UserCell from './UserCell/index'

const ContactList: FC<{
  selectedSectionId: number
  contactList: User[]
}> = ({ selectedSectionId, contactList }) => {
  return (
    <div className='gx-chat-user'>
      {contactList.map((user, index) => (
        <UserCell
          key={index}
          user={user}
          selectedSectionId={selectedSectionId}
        />
      ))}
    </div>
  )
}

export default ContactList
