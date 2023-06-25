import { combineReducers } from "redux";
import AuthReducer from "../actions/auth";
import SettingsReducer from "../actions/settings";

export const rootReducer = combineReducers({
  auth: AuthReducer,
  settings: SettingsReducer,
});
