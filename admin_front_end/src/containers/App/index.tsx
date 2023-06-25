import { useSelector } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import MainApp from './MainApp'
import SignIn from '../SignIn'
import PrivateRoute from '../hoc/PrivateRoute'
import Authinit from '../Auth/Authinit'

const App = (): JSX.Element => {
  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated
  )

  return (
    <Switch>
      <Route exact path='/signin' component={SignIn} />
      <Authinit>
        <PrivateRoute
          isAuthenticated={isAuthenticated}
          path='/'
          component={MainApp}
        />
      </Authinit>
    </Switch>
  )
}

export default App
