import { combineReducers } from 'redux'
import { all } from 'redux-saga/effects'
import AuthReducer from '../actions/auth'
import SettingsReducer from '../actions/settings'
import { saga } from './auth'

export const rootReducer = combineReducers({
  auth: AuthReducer,
  settings: SettingsReducer
})

export function* rootSaga () {
  yield all([saga()])
}
