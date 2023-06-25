import { Route, Redirect, RouteProps } from 'react-router-dom'
import { User } from '../../types'

type Props = {
  isAuthenticated: boolean
  user: User | undefined
  component: any
} & RouteProps

export const ProtectedRoute: React.FC<Props> = ({
  component: Component,
  isAuthenticated,
  user,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthenticated) {
          return <Component {...props} />
        } else {
          return (
            <Redirect
              to={{
                pathname: '/signin',
                state: { from: props.location }
              }}
            />
          )
        }
      }}
    />
  )
}

export default ProtectedRoute
