import { Dispatch } from 'react'
import { Link } from 'react-router-dom'

interface SidebarLogoProps {
  sidebarCollapsed: boolean
  setSidebarCollapsed: Dispatch<React.SetStateAction<boolean>>
}
const SidebarLogo = ({
  sidebarCollapsed,
  setSidebarCollapsed
}: SidebarLogoProps) => {
  return (
    <div
      className='gx-layout-sider-header'
      style={{ backgroundColor: 'rgb(15 66 210 / 1)' }}
    >
      <div className='gx-linebar'>
        <i
          className={`gx-icon-btn icon icon-menu-fold gx-text-white`}
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
