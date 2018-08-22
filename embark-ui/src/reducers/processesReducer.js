import {RECEIVE_PROCESSES, RECEIVE_PROCESSES_ERROR, RECEIVE_PROCESS_LOGS, RECEIVE_PROCESS_LOGS_ERROR} from "../actions";

export default function processes(state = {}, action) {
  switch (action.type) {
    case RECEIVE_PROCESSES:
      return Object.assign({}, state, {data: action.processes.data});
    case RECEIVE_PROCESSES_ERROR:
      return Object.assign({}, state, {error: action.error});
    case RECEIVE_PROCESS_LOGS:
      return {
        ...state,
        logs: {
          ...state.logs,
          [action.processName]: action.logs.data
        }
      };
    case RECEIVE_PROCESS_LOGS_ERROR:
      return Object.assign({}, state, {error: action.error});
    default:
      return state;
  }
}
