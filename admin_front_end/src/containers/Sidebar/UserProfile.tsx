import { Avatar, Popover } from 'antd'

const UserProfile = () => {
  return (
    <div className='gx-flex-row gx-align-items-center gx-mb-4 gx-avatar-row'>
      <Popover placement='bottomRight' visible={false} trigger='click'>
        <Avatar
          src={'https://via.placeholder.com/150'}
          className='gx-size-40 gx-pointer gx-mr-3'
          alt=''
        />
        <span className='gx-avatar-name'>
          <i className='icon icon-chevron-down gx-fs-xxs gx-ml-2' />
        </span>
      </Popover>
    </div>
  )
}

export default UserProfile
