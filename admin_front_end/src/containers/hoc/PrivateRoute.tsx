/* eslint-disable react/prop-types */
import { Route, Redirect, RouteProps } from 'react-router-dom'

type Props = {
  isAuthenticated: boolean
  component: any
} & RouteProps

export const ProtectedRoute: React.FC<Props> = ({
  component: Component,
  isAuthenticated,
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
