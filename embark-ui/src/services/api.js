import axios from "axios";
import constants from '../constants';
import {get as cacheGet} from '../services/cache';

function request(type, path, params = {}, endpoint) {
  axios.defaults.headers.common['Authorization'] = cacheGet('token');
  const callback = params.callback || function(){};
  return axios[type]((endpoint || constants.httpEndpoint) + path, params)
    .then((response) => {
      const data = (response.data && response.data.error) ? {error: response.data.error} : {response, error: null};
      callback(data.error, data.response);
      return data;
    }).catch((error) => {
      const data = {response: null, error: error.message || 'Something bad happened'};
      callback(data.error, data.response);
      return data;
    });
}

function get() {
  return request('get', ...arguments);
}

function post() {
  return request('post', ...arguments);
}

function destroy() {
  return request('delete', ...arguments);
}

export function postCommand(payload) {
  return post('/command', payload);
}

export function fetchAccounts() {
  return get('/blockchain/accounts');
}

export function fetchAccount(payload) {
  return get(`/blockchain/accounts/${payload.address}`);
}

export function fetchBlocks(payload) {
  return get('/blockchain/blocks', {params: payload});
}

export function fetchBlock(payload) {
  return get(`/blockchain/blocks/${payload.blockNumber}`);
}

export function fetchTransactions(payload) {
  return get('/blockchain/transactions', {params: payload});
}

export function fetchTransaction(payload) {
  return get(`/blockchain/transactions/${payload.hash}`);
}

export function fetchProcesses() {
  return get('/processes');
}

export function fetchProcessLogs(payload) {
  return get(`/process-logs/${payload.processName}`);
}

export function fetchContractLogs() {
  return get(`/contracts/logs`);
}

export function fetchContracts() {
  return get('/contracts');
}

export function fetchContract(payload) {
  return get(`/contract/${payload.contractName}`);
}

export function postContractFunction(payload) {
  return post(`/contract/${payload.contractName}/function`, payload);
}

export function postContractDeploy(payload) {
  return post(`/contract/${payload.contractName}/deploy`, payload);
}

export function postContractCompile(payload) {
  return post('/contract/compile', payload);
}

export function fetchVersions() {
  return get('/versions');
}

export function fetchPlugins() {
  return get('/plugins');
}

export function sendMessage(payload) {
  return post(`/communication/sendMessage`, payload.body);
}

export function fetchContractProfile(payload) {
  return get(`/profiler/${payload.contractName}`);
}

export function fetchEnsRecord(payload) {
  if (payload.name) {
    return get('/ens/resolve', {params: payload});
  } else {
    return get('/ens/lookup', {params: payload});
  }
}

export function postEnsRecord(payload) {
  return post('/ens/register', payload);
}

export function getEthGasAPI() {
  return get('/blockchain/gas/oracle', {});
}

export function fetchFiles() {
  return get('/files');
}

export function fetchFile(payload) {
  return get('/file', {params: payload});
}

export function postFile(payload) {
  return post('/files', payload);
}

export function deleteFile(payload) {
  return destroy('/file', {params: payload});
}

export function authorize(payload) {
  return post('/authorize', payload);
}

export function listenToChannel(channel) {
  return new WebSocket(`${constants.wsEndpoint}/communication/listenTo/${channel}`);
}

export function webSocketProcess(processName) {
  return new WebSocket(constants.wsEndpoint + '/process-logs/' + processName);
}

export function webSocketContractLogs() {
  return new WebSocket(constants.wsEndpoint + '/contracts/logs');
}

export function webSocketBlockHeader() {
  return new WebSocket(`${constants.wsEndpoint}/blockchain/blockHeader`);
}

export function websocketGasOracle() {
  return new WebSocket(`${constants.wsEndpoint}/blockchain/gas/oracle`);
}
