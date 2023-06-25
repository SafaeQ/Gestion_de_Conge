import { put, takeLatest } from "redux-saga/effects";
import { SET_CURRENT_USER, REQUEST_USER } from "../../constants/ActionTypes";
import { User } from "../../types";
import { transport } from "../../util/Api";

export const actions = {
  setUser: (user: any) => ({ type: SET_CURRENT_USER, payload: user }),
};

export function* saga() {
  yield takeLatest(REQUEST_USER, function* userRequested() {
    const { user } = yield transport
      .get<{ user: User }>("/me")
      .then((res) => res.data);
    localStorage.setItem("user-id", user.id);
    yield put(actions.setUser(user));
  });
}
