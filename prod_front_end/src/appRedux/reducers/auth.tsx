import { put, takeLatest } from 'redux-saga/effects'
import { SET_CURRENT_USER, REQUEST_USER } from '../../constants/ActionTypes'
import axios from 'axios'
import { User } from '../../types'

export const actions = {
  setUser: (user: User) => ({ type: SET_CURRENT_USER, payload: user })
}

export function* saga() {
  yield takeLatest(REQUEST_USER, function* userRequested() {
    const data: { user: User } = yield axios.get('/me').then((res) => res.data)
    localStorage.setItem('user-id', String(data.user.id))
    yield put(actions.setUser(data.user))
  })
}
