import {combineReducers} from 'redux';
import {RECEIVE_ACCOUNTS, RECEIVE_ACCOUNTS_ERROR} from "../actions";
import processesReducer from './processesReducer';

function accounts(state = {}, action) {
  switch (action.type) {
    case RECEIVE_ACCOUNTS:
      return Object.assign({}, state, {data: action.accounts.data});
    case RECEIVE_ACCOUNTS_ERROR:
      return Object.assign({}, state, {error: true});
    default:
      return state;
  }
}

const rootReducer = combineReducers({accounts, processes: processesReducer});
export default rootReducer;
