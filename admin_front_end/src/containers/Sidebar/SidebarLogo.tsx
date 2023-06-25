import type { Dispatch } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  sidebarCollapsed: boolean
  setSidebarCollapsed: Dispatch<React.SetStateAction<boolean>>
}

const SidebarLogo = ({ sidebarCollapsed, setSidebarCollapsed }: Props) => {
  return (
    <div className='gx-layout-sider-header'>
      <div className='gx-linebar'>
        <i
          className='gx-icon-btn icon icon-menu-fold gx-text-white'
          onClick={() => {
            setSidebarCollapsed(!sidebarCollapsed)
          }}
        />
      </div>

      <Link to='/' className='gx-site-logo'></Link>
    </div>
  )
}

export default SidebarLogo
