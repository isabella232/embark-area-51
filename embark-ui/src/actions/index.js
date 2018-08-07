// Accounts
export const REQUEST = 'REQUEST';
export const SUCCESS = 'SUCCESS';
export const FAILURE = 'FAILURE';

function createRequestTypes(base) {
  return [REQUEST, SUCCESS, FAILURE].reduce((acc, type) => {
    acc[type] = `${base}_${type}`;
    return acc;
  }, {});
}

function action(type, payload = {}) {
  return {type, ...payload};
}

export const ACCOUNTS = createRequestTypes('ACCOUNTS');
export const accounts = {
  request: () => action(ACCOUNTS[REQUEST]),
  success: (accounts) => action(ACCOUNTS[SUCCESS], {accounts}),
  failure: (error) => action(ACCOUNTS[FAILURE], {error})
};

export const ACCOUNT = createRequestTypes('ACCOUNT');
export const account = {
  request: (address) => action(ACCOUNT[REQUEST], {address}),
  success: (account) => action(ACCOUNT[SUCCESS], {account}),
  failure: (error) => action(ACCOUNT[FAILURE], {error})
};

export const BLOCKS = createRequestTypes('BLOCKS');
export const blocks = {
  request: (from) => action(BLOCKS[REQUEST], {from}),
  success: (blocks) => action(BLOCKS[SUCCESS], {blocks}),
  failure: (error) => action(BLOCKS[FAILURE], {error})
};

export const BLOCK = createRequestTypes('BLOCK');
export const block = {
  request: (blockNumber) => action(BLOCK[REQUEST], {blockNumber}),
  success: (block) => action(BLOCK[SUCCESS], {block}),
  failure: (error) => action(BLOCK[FAILURE], {error})
};

export const TRANSACTIONS = createRequestTypes('TRANSACTIONS');
export const transactions = {
  request: (blockFrom) => action(TRANSACTIONS[REQUEST], {blockFrom}),
  success: (transactions) => action(TRANSACTIONS[SUCCESS], {transactions}),
  failure: (error) => action(TRANSACTIONS[FAILURE], {error})
};

export const TRANSACTION = createRequestTypes('TRANSACTION');
export const transaction = {
  request: (hash) => action(TRANSACTION[REQUEST], {hash}),
  success: (transaction) => action(TRANSACTION[SUCCESS], {transaction}),
  failure: (error) => action(TRANSACTION[FAILURE], {error})
};

export const PROCESSES = createRequestTypes('PROCESSES');
export const processes = {
  request: () => action(PROCESSES[REQUEST]),
  success: (processes) => action(PROCESSES[SUCCESS], {processes}),
  failure: (error) => action(PROCESSES[FAILURE], {error})
};

export const COMMANDS = createRequestTypes('COMMANDS');
export const commands = {
  post: (command) => action(COMMANDS[REQUEST], {command}),
  success: (result) => action(COMMANDS[SUCCESS], {result}),
  failure: (error) => action(COMMANDS[FAILURE], {error})
};

// Process logs
export const FETCH_PROCESS_LOGS = 'FETCH_PROCESS_LOGS';
export const RECEIVE_PROCESS_LOGS = 'RECEIVE_PROCESS_LOGS';
export const WATCH_NEW_PROCESS_LOGS = 'WATCH_NEW_PROCESS_LOGS';
export const RECEIVE_NEW_PROCESS_LOG = 'RECEIVE_NEW_PROCESS_LOG';
export const RECEIVE_PROCESS_LOGS_ERROR = 'RECEIVE_PROCESS_LOGS_ERROR';
// BlockHeader
export const INIT_BLOCK_HEADER = 'INIT_BLOCK_HEADER';
// Contracts
export const FETCH_CONTRACTS = 'FETCH_CONTRACTS';
export const RECEIVE_CONTRACTS = 'RECEIVE_CONTRACTS';
export const RECEIVE_CONTRACTS_ERROR = 'RECEIVE_CONTRACTS_ERROR';
// Contract
export const FETCH_CONTRACT = 'FETCH_CONTRACT';
export const RECEIVE_CONTRACT = 'RECEIVE_CONTRACT';
export const RECEIVE_CONTRACT_ERROR = 'RECEIVE_CONTRACT_ERROR';
// Contract Profile
export const FETCH_CONTRACT_PROFILE = 'FETCH_CONTRACT_PROFILE';
export const RECEIVE_CONTRACT_PROFILE = 'RECEIVE_CONTRACT_PROFILE';
export const RECEIVE_CONTRACT_PROFILE_ERROR = 'RECEIVE_CONTRACT_PROFILE_ERROR';

export function fetchProcessLogs(processName) {
  return {
    type: FETCH_PROCESS_LOGS,
    processName
  };
}

export function listenToProcessLogs(processName) {
  return {
    type: WATCH_NEW_PROCESS_LOGS,
    processName
  };
}

export function receiveProcessLogs(processName, logs) {
  return {
    type: RECEIVE_PROCESS_LOGS,
    processName,
    logs
  };
}

export function receiveProcessLogsError(error) {
  return {
    type: RECEIVE_PROCESS_LOGS_ERROR,
    error
  };
}

export function initBlockHeader(){
  return {
    type: INIT_BLOCK_HEADER
  };
}

export function fetchContractProfile(contractName) {
  return {
    type: FETCH_CONTRACT_PROFILE,
    contractName
  };
}

export function receiveContractProfile(contractProfile) {
  return {
    type: RECEIVE_CONTRACT_PROFILE,
    contractProfile
  };
}

export function receiveContractProfileError() {
  return {
    type: RECEIVE_CONTRACT_PROFILE_ERROR
  };
}

export function fetchContract(contractName) {
  console.dir("== fetchContract");
  console.dir(contractName);
  return {
    type: FETCH_CONTRACT,
    contractName
  };
}

export function receiveContract(contract) {
  console.dir("== receiveContract");
  console.dir(contract);
  return {
    type: RECEIVE_CONTRACT,
    contract
  };
}

export function receiveContractError() {
  console.dir("== receiveContractError");
  return {
    type: RECEIVE_CONTRACT_ERROR
  };
}


export function fetchContracts() {
  return {
    type: FETCH_CONTRACTS
  };
}

export function receiveContracts(contracts) {
  return {
    type: RECEIVE_CONTRACTS,
    contracts
  };
}

export function receiveContractsError() {
  return {
    type: RECEIVE_CONTRACTS_ERROR
  };
}

