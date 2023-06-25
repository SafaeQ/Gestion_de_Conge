import { Layout, Popover } from 'antd'
import { Link } from 'react-router-dom'
import { LogoutOutlined } from '@ant-design/icons'
import { TAB_SIZE } from '../../constants/ThemeSetting'
import { toggleCollapsedSideNav } from '../../appRedux/actions/settings'
import { useAppSelector, useAppDispatch } from '../../appRedux/hooks'
import { transport } from '../../util/Api'
import { setCurrentUser } from '../../appRedux/actions/auth'
import type { User } from '../../types'
const { Header } = Layout

const Topbar = () => {
  const { width, navCollapsed } = useAppSelector(({ settings }) => settings)
  const dispatch = useAppDispatch()
  const Menu = () => (
    <ul className='gx-sub-popover'>
      <li
        className='gx-media gx-pointer'
        onClick={() => {
          transport
            .post('/auth/users/support/logout')
            .then(() => {
              dispatch(setCurrentUser({} as unknown as User))
            })
            .catch((err) => console.log(err))
        }}
      >
        <span className='gx-language-text'>
          {' '}
          <LogoutOutlined /> Logout
        </span>
      </li>
    </ul>
  )

  return (
    <Header>
      {width < TAB_SIZE ? (
        <div className='gx-linebar gx-mr-3'>
          <i
            className='gx-icon-btn icon icon-menu'
            onClick={() => {
              dispatch(toggleCollapsedSideNav(!navCollapsed))
            }}
          />
        </div>
      ) : null}
      <Link to='/' className='gx-d-block gx-d-lg-none gx-pointer'></Link>

      <ul className='gx-header-notifications gx-ml-auto'>
        <Popover
          overlayClassName='gx-popover-horizantal'
          placement='bottomRight'
          content={Menu()}
          trigger='click'
        >
          <span className='gx-pointer gx-flex-row gx-align-items-center'>
            <i
              className='icon icon-chevron-down gx-pl-2'
              style={{ color: 'white' }}
            />
          </span>
        </Popover>
      </ul>
    </Header>
  )
}

export default Topbar
