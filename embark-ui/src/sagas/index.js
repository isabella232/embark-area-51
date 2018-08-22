import * as actions from '../actions';
import * as api from '../api';
import {all, call, fork, put, takeEvery} from 'redux-saga/effects';

export function *fetchTransactions(payload) {
  try {
    const transactions = yield call(api.fetchTransactions, payload.blockFrom);
    yield put(actions.receiveTransactions(transactions));
  } catch (e) {
    yield put(actions.receiveTransactionsError());
  }
}

export function *watchFetchTransactions() {
  yield takeEvery(actions.FETCH_TRANSACTIONS, fetchTransactions);
}

export function *fetchBlocks(payload) {
  try {
    const blocks = yield call(api.fetchBlocks, payload.from);
    yield put(actions.receiveBlocks(blocks));
  } catch (e) {
    yield put(actions.receiveBlocksError());
  }
}

export function *watchFetchBlocks() {
  yield takeEvery(actions.FETCH_BLOCKS, fetchBlocks);
}

export function *fetchAccounts() {
  try {
    const accounts = yield call(api.fetchAccounts);
    yield put(actions.receiveAccounts(accounts));
  } catch (e) {
    yield put(actions.receiveAccountsError());
  }
}

export function *watchFetchAccounts() {
  yield takeEvery(actions.FETCH_ACCOUNTS, fetchAccounts);
}

export function *fetchProcesses() {
  try {
    const processes = yield call(api.fetchProcesses);
    yield put(actions.receiveProcesses(processes));
  } catch (e) {
    yield put(actions.receiveProcessesError(e));
  }
}

export function *watchFetchProcesses() {
  yield takeEvery(actions.FETCH_PROCESSES, fetchProcesses);
}

export function *fetchProcessLogs(action) {
  try {
    const logs = yield call(api.fetchProcessLogs, action.processName);
    yield put(actions.receiveProcessLogs(action.processName, logs));
  } catch (e) {
    yield put(actions.receiveProcessLogsError(e));
  }
}

export function *watchFetchProcessLogs() {
  yield takeEvery(actions.FETCH_PROCESS_LOGS, fetchProcessLogs);
}

export default function *root() {
  yield all([
    fork(watchFetchAccounts),
    fork(watchFetchProcesses),
    fork(watchFetchProcessLogs),
    fork(watchFetchBlocks),
    fork(watchFetchTransactions)
  ]);
}
