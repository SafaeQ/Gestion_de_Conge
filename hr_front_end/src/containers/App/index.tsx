import { useSelector } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import MainApp from './MainApp'
import SignIn from '../SignIn'
import PrivateRoute from '../hoc/PrivateRoute'
import Authinit from '../Auth/Authinit'
import { RootState } from '../../appRedux/store'
import { User } from '../../types'

const App = () => {
  const isAuthenticated = useSelector<RootState, boolean | undefined>(
    (state) => state.auth.isAuthenticated
  )
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  )
  return (
    <Switch>
      <Route exact path='/signin' component={SignIn} />
      <Authinit>
        <PrivateRoute
          user={user}
          isAuthenticated={!(isAuthenticated === false)}
          path={`/`}
          component={MainApp}
        />
      </Authinit>
    </Switch>
  )
}

export default App
