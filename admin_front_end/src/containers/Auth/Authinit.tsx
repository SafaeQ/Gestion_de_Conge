import { useRef, useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { setCurrentUser } from '../../appRedux/actions/auth'
import { transport } from '../../util/Api'
import Spinner from '../Spinner'

function AuthInit (props: { children: any }) {
  const didRequest = useRef(false)
  const dispatch = useDispatch()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  // We should request user by authToken before rendering the application
  useEffect(() => {
    const requestUser = async () => {
      try {
        if (!didRequest.current) {
          const { user } = await transport
            .get('/auth/users/admin/me')
            .then((res: { data: any }) => res.data)
          dispatch(setCurrentUser(user))
        }
      } catch (error) {
        if (!didRequest.current) {
          transport
            .post('/auth/users/admin/logout')
            .then(() => {
              localStorage.removeItem('user-id')
              dispatch(setCurrentUser(undefined))
            })
            .catch((err) => {
              console.log(err)
            })
        }
      } finally {
        setShowSplashScreen(false)
      }

      return () => (didRequest.current = true)
    }

    void requestUser()
  }, [])

  return showSplashScreen ? <Spinner /> : <>{props.children}</>
}

export default connect()(AuthInit)
