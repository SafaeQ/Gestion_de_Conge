import { Result } from 'antd'
import { Route, RouteProps } from 'react-router-dom'
import { ROLE, User } from '../../types'

type Props = {
  isAuthenticated: boolean
  user: User | undefined
  component: any
} & RouteProps

export const ChefProtectedRoute: React.FC<Props> = ({
  component: Component,
  isAuthenticated,
  user,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthenticated && user?.role === ROLE.CHEF) {
          return <Component {...props} />
        } else {
          return (
            <Result
              status='403'
              title='403'
              subTitle='Sorry, you are not authorized to access this page.'
            />
          )
        }
      }}
    />
  )
}

export default ChefProtectedRoute
